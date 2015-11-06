BASE.require([
    "jQuery",
    "bowser",
    "JSON",
    "jQuery.fn.on",
    "BASE.util.Guid",
    "BASE.async.Future",
    "Array.prototype.forEach",
    "String.prototype.trim",
    "BASE.web.PathResolver",
    "BASE.web.HttpRequest",
    "BASE.collections.Hashmap",
    "BASE.async.delayAsync"
], function () {
    
    var HttpRequest = BASE.web.HttpRequest;
    var Future = BASE.async.Future;
    var Guid = BASE.util.Guid;
    var PathResolver = BASE.web.PathResolver;
    var Hashmap = BASE.collections.Hashmap;
    var relativePathsRegEx = /(\S+)=["']?(\.\/(?:.(?!["']?\s+(?:\S+)=|[>"']))+.)["']?/gi;
    var cssUrlPathRegEx = /url\(["']?(\.\/.*?)["']?\)/gi;
    var importRegEx = /@import url\(\"?(.*?)\"?\)\;/gi;
    var disallowedDiggers = "iframe, object, embed, [template]";
    var global = (function () { return this; }());
    var delayAsync = BASE.async.delayAsync;
    var lastResizeFuture = Future.fromResult();
    
    var ServiceLocator = function () {
        Hashmap.call(this);
        this.set = this.add;
    };
    var globalConfig = {
        aliases: {}
    };
    
    var isHTML4 = (function () {
        if ("querySelector" in document && "localStorage" in global && "addEventListener" in global) {
            return false;
        } else {
            return true;
        }
    }());
    
    var windowResizeEvent = new $.Event("windowResize");
    
    $(function () {
        $(window).resize(function () {
            lastResizeFuture.cancel();
            lastResizeFuture = delayAsync(50).then(function () {
                $("[component]").each(function () {
                    $(this).triggerHandler(windowResizeEvent);
                });
            });
        });
    });
    
    var HtmlCache = function () {
        var self = this;
        var cache = {};
        
        self.addComponentHtml = function (url, html) {
            cache[url] = Future.fromResult(html);
        }
        
        self.getComponentHtml = function (url) {
            if (cache[url]) {
                return cache[url];
            } else {
                
                var request = new HttpRequest(url);
                
                return cache[url] = request.sendAsync().chain(function (xhr) {
                    var html = xhr.responseText;
                    var resolver = new PathResolver(url);
                    
                    return html.replace(relativePathsRegEx, function (match, attributeName, value) {
                        resolver.setPath(url);
                        value = resolver.resolve(value);
                        return attributeName + "=\"" + value.replace(/"/g, "\\\"") + "\"";
                    }).replace(cssUrlPathRegEx, function (match, value) {
                        resolver.setPath(url);
                        value = resolver.resolve(value);
                        return "url(" + value + ")";
                    });

                }).catch(function (error) {
                    cache[url] = null;
                    return Future.fromError(error);
                });

            }
        };

    };
    
    // Add utility function to jQuery.
    jQuery.prototype.controller = function () {
        return $(this[0]).data("controller");
    };
    
    BASE.namespace("BASE.web");
    
    BASE.web.ComponentsDocument = function (document, servicesHash) {
        var self = this;
        servicesHash = servicesHash || {};
        
        var styleFragments = document.createDocumentFragment();
        var concatPaths = function () {
            var args = Array.prototype.slice.call(arguments, 0);
            return args.reduce(function (value, nextUrl, index) {
                
                while (nextUrl.length > 0 && nextUrl.lastIndexOf("/") === nextUrl.length - 1) {
                    nextUrl = nextUrl.substring(0, nextUrl.length - 1);
                }
                
                if (index > 0) {
                    while (nextUrl.indexOf("/") === 0) {
                        nextUrl = nextUrl.substring(1, nextUrl.length);
                    }
                }
                
                if (index > 0) {
                    return value + "/" + nextUrl;
                } else {
                    return nextUrl;
                }

            }, "");
        };
        var $tempEmbedContainer = $(document.createElement("div"));
        
        var style = document.createElement("style");
        var $componentStyles = $(style).data("components", {});
        style.setAttribute("type", "text/css");
        $("head").prepend(style);
        
        var services = new ServiceLocator();
        
        var exceptionDontCheck = {
            path: true,
            version: true
        };
        
        var withInVersion = function (versions) {
            var hasMatch = false;
            var version = parseInt(bowser.version, 10);
            
            if (typeof versions === "undefined") {
                hasMatch = true;
            } else {
                hasMatch = versions.some(function (exceptionVersion) {
                    
                    if (typeof exceptionVersion === "number") {
                        if (exceptionVersion === version) {
                            return true;
                        } else {
                            return false;
                        }
                    } else {
                        
                        if (typeof exceptionVersion.to === "number" && typeof exceptionVersion.from === "number") {
                            // Range
                            if (version <= exceptionVersion.to && version >= exceptionVersion.from) {
                                return true;
                            } else {
                                return false;
                            }
                        } else if (typeof exceptionVersion.to === "number" && typeof exceptionVersion.from === "undefined") {
                            // Less Than
                            if (version <= exceptionVersion.to) {
                                return true;
                            } else {
                                return false;
                            }
                        } else if (typeof exceptionVersion.to === "undefined" && typeof exceptionVersion.from === "number") {
                            // Greater Than   
                            if (version >= exceptionVersion.from) {
                                return true;
                            } else {
                                return false;
                            }
                        }

                    }
                });
            }
            
            return hasMatch;
        };
        
        var getBrowserAlias = function (aliasObject) {
            var exceptions = aliasObject.exceptions || [];
            var alias = aliasObject["default"];
            
            if (typeof alias !== "string") {
                throw new Error("There needs to be a default alias.");
            }
            
            // The reason we use an every here is so that when we have a match we exit the loop.
            for (var x = 0; x < exceptions.length; x++) {
                var breakLoop = (function (x) {
                    var exception = exceptions[x];
                    
                    var matchedCriteria = Object.keys(exception).every(function (key) {
                        if (!exceptionDontCheck.hasOwnProperty(key)) {
                            return exception[key] === bowser[key];
                        } else {
                            // return true for properties only components is concerned about
                            return true;
                        }
                    });
                    
                    var hasMatch = withInVersion(exception.versions);
                    var breakLoop = false;
                    
                    if (matchedCriteria && hasMatch) {
                        alias = exception.path;
                    }
                    
                    // If it has a match then get out of loop;
                    return breakLoop;

                })(x);
                
                if (breakLoop) {
                    break;
                }
            }
            
            return alias;
        };
        
        var fixConfigBasedOnBrowser = function (config) {
            var aliases = config.aliases;
            
            Object.keys(aliases).forEach(function (key) {
                if (typeof aliases[key] !== "string") {
                    aliases[key] = getBrowserAlias(aliases[key]);
                }
            });
        };
        
        var getConfig = function (url, root) {
            if (!url) {
                throw new Error("Config was missing a url.");
            }
            
            var request = new HttpRequest(url);
            return request.sendAsync().chain(function (xhr) {
                var responseText = xhr.responseText;
                try {
                    var config = JSON.parse(responseText);
                    config.root = root;
                    fixConfigBasedOnBrowser(config);
                    return config;
                } catch (e) {
                    throw new Error("Config had invalid JSON.");
                }
            });
        };
        
        var getConfigInElement = function (elem) {
            var configs = $(elem).find("script[type='components/config']");
            var configFutures = [];
            
            // This will run once to get the global config, so we don't want to include it on the first go around.
            if (typeof globalConfigFuture !== "undefined") {
                configFutures.push(globalConfigFuture);
            }
            
            configs.each(function () {
                var $config = $(this);
                var root = $config.attr("root") || undefined;
                
                var url = $config.attr("src");
                if (!url) {
                    try {
                        var configObj = JSON.parse($config.html())
                        configObj.root = root;
                        configFutures.push(Future.fromResult(configObj));
                    } catch (e) {
                        configFutures.push(Future.fromError(e));
                    }
                } else {
                    configFutures.push(getConfig(url, root));
                }
            });
            
            return Future.all(configFutures).chain(function (configs) {
                var concatConfig = globalConfig;
                
                configs.forEach(function (config) {
                    Object.keys(config.aliases).forEach(function (key) {
                        var root = config.root || "";
                        concatConfig.aliases[key] = concatPaths(root, config.aliases[key]);
                    });
                });
                
                return concatConfig;
            });

        };
        
        var globalConfigFuture = getConfigInElement($("head")[0]);
        
        var appendStyle = function (text) {
            var style = $componentStyles[0];
            var css;
            
            if (text) {
                if (isHTML4) {   // Old IE
                    css = style.styleSheet.cssText || "";
                    css += text;
                    style.styleSheet.cssText = css;
                } else {// the world
                    var $styleSheet = $("<style type=\"text/css\"></style>");
                    $styleSheet.text(text);
                    $styleSheet.prependTo(styleFragments);
                }
            }
        };
        
        var stripOutImports = function (text, onEach) {
            onEach = onEach || function () { };
            var match = importRegEx.exec(text);
            
            while (match !== null) {
                onEach(match[1]);
                match = importRegEx.exec(text);
            }
            
            var newText = text.replace(importRegEx, "");
            
            return text;
        };
        
        var createLinks = function (text) {
            return stripOutImports(text, function (url) {
                if (document.createStyleSheet) {
                    document.createStyleSheet(url);
                }
                else {
                    $componentStyles.before("<link rel=\"stylesheet\" href=\"" + url + "\" />");
                }
            });
        };
        var handleStyles = function (url, $element) {
            var attachStyle = function (index) {
                var $this = $(this);
                var style = $componentStyles[0];
                var exist;
                var components = $componentStyles.data("components");
                var text;
                
                exist = components[url + index];
                if (!exist) {
                    components[url + index] = url;
                    
                    if (isHTML4) {
                        text = this.styleSheet.cssText;
                    } else {// the world
                        text = $this.text();
                    }
                    
                    text = createLinks(text);
                    appendStyle(text);
                }
            };
            
            if ($element[0].tagName.toUpperCase() === "STYLE") {
                $element.remove().each(attachStyle);
            }
            $element.find("style").remove().each(attachStyle);
        };
        
        var ComponentCache = function () {
            var self = this;
            var cache = {};
            var htmlCache = new HtmlCache();
            
            self.fillCache = function (urlToHtmlHash) {
                Object.keys(urlToHtmlHash).forEach(function (key) {
                    htmlCache.addComponentHtml(key, urlToHtmlHash[key]);
                });
            };
            
            self.getComponentTemplate = function (url) {
                if (cache[url]) {
                    return cache[url];
                } else {
                    
                    return cache[url] = htmlCache.getComponentHtml(url).chain(function (html) {
                        var $element = $(html);
                        var element = $element[0];
                        var futureComponents = [];
                        
                        var guid = Guid.create();
                        
                        $element.attr("cid", guid);
                        
                        $element.find("[tag]").each(function () {
                            var $this = $(this);
                            $this.attr("owner", guid);
                        });
                        
                        $element.children().each(function () {
                            var oldElement = this;
                            
                            futureComponents.push(loadComponentsDeep(oldElement).chain(function (newElement) {
                                $(oldElement).replaceWith(newElement);
                            }));
                        });
                        
                        return Future.all(futureComponents).chain(function () {
                            handleStyles(url, $element);
                            if (element.tagName.toUpperCase() === "STYLE") {
                                return document.createElement("STYLE");
                            } else {
                                return element;
                            }
                        });

                    }).catch(function (error) {
                        cache[url] = null;
                        return Future.fromError(error);
                    });
                }

            };
            
            self.loadComponent = function (url, $withContent) {
                return self.getComponentTemplate(url).chain(function (template) {
                    var element = $(template).clone()[0];
                    var $element = $(element);
                    var callbacks = [];
                    
                    // Fills the content tags with matching criteria.
                    var $embedTags = $element.find("embed").each(function () {
                        var $embed = $(this);
                        var selector = $embed.attr("select");
                        if (selector) {
                            // For some reason selectors don't work on document fragments.
                            // So we wrap it and do a search.
                            $withContent.appendTo($tempEmbedContainer);
                            
                            $tempEmbedContainer.children(selector).each(function () {
                                var child = this;
                                
                                if (!child.componentSelected) {
                                    child.componentSelected = true;
                                    callbacks.push(function () {
                                        $(child).remove().insertBefore($embed);
                                    });
                                }
                            });
                            
                            $withContent = $tempEmbedContainer.contents();
                            $tempEmbedContainer.empty();
                        } else {
                            callbacks.push(function () {
                                $withContent.insertBefore($embed);
                            });
                        }

                    });
                    
                    callbacks.forEach(function (callback) { callback(); });
                    $embedTags.remove();
                    
                    return element;
                });

            };
            
            self.getUris = function () {
                return Object.keys(cache);
            };
        };
        var componentCache = new ComponentCache();
        
        // This will not be this way in future components.
        if (typeof _componentCache === "object" && _componentCache !== null) {
            componentCache.fillCache(_componentCache);
        }
        
        var walkTheDomAsync = function (element, asyncOperation) {
            var futureElements = [];
            var $element = $(element);
            
            if (!$element.is(disallowedDiggers)) {
                $element.children().each(function () {
                    futureElements.push(walkTheDomAsync(this, asyncOperation));
                });
            }
            
            return Future.all(futureElements).chain(function () {
                return asyncOperation(element);
            });;
        };
        
        var buildDomAsync = function (element, asyncOperation) {
            var futureElements = [];
            var $element = $(element);
            
            if (!$element.is(disallowedDiggers)) {
                $element.contents().each(function () {
                    futureElements.push(buildDomAsync(this, asyncOperation));
                });
            }
            
            return Future.all(futureElements).chain(function () {
                return asyncOperation(element);
            }).chain(function (lastElement) {
                if (lastElement !== element) {
                    $element.replaceWith(lastElement);
                    return lastElement;
                } else {
                    return element;
                }
            });

        };
        
        var setupScopeAndTags = function ($element) {
            var tags = {};
            var $component = $element.closest("[component]");
            var guid = $component.attr("cid");
            
            $component.find("[owner='" + guid + "']").each(function () {
                var $this = $(this);
                if ($this.closest("[cid='" + guid + "']")[0] === $component[0]) {
                    tags[$this.attr("tag")] = this;
                }
            });
            
            $element.data("tags", tags);
            $element.data("scope", services);
        }
        
        var loadControllers = function (startElement) {
            
            return walkTheDomAsync(startElement, function (element) {
                var $element = $(element);
                
                var controllerName = $element.attr("controller");
                var controllerFuture = Future.fromResult(null);
                
                setupScopeAndTags($element);
                
                // Instantiate the controller if applicable
                if (controllerName && !$element.data("controller")) {
                    $element.data("controller", "loading...");
                    
                    controllerFuture = BASE.require([controllerName]).chain(function () {
                        var Controller = BASE.getObject(controllerName);
                        
                        var instance = new Controller(element, $element.data("tags"), $element.data("scope"));
                        
                        $element.data("controller", instance);
                        
                        return instance;
                    });
                }
                
                // When the controller is set up, apply behaviors if applicable
                return controllerFuture.chain(function (controller) {
                    controller = controller || {};
                    var applyList = $element.attr("apply");
                    
                    if (applyList) {
                        var behaviors = applyList.split(";").map(function (b) { return b.trim(); });
                        return BASE.require(behaviors).chain(function () {
                            behaviors.forEach(function (b) {
                                var Behavior = BASE.getObject(b);
                                Behavior.call(controller, element, $element.data("tags"), $element.data("scope"));
                            });
                        });
                    }
                });

            });
        };
        
        var loadComponentsDeep = function (startElement) {
            var startElementClone = $(startElement).clone()[0];
            
            return buildDomAsync(startElementClone, function (element) {
                var $element = $(element);
                
                var componentName = $element.attr("component");
                
                // Make sure the component isn't loaded twice.
                if (componentName && !$element.data("componentLoaded")) {
                    // We need to check the global aliases for a match.
                    return globalConfigFuture.chain(function (config) {
                        var aliases = config.aliases;
                        componentName = aliases[componentName] || componentName;
                        
                        return componentCache.loadComponent(componentName, $element.contents().remove()).chain(function (clone) {
                            var domAttribute;
                            // Apply attributes that were on the previous element.
                            for (var x = 0; x < element.attributes.length; x++) {
                                domAttribute = element.attributes.item(x);
                                $(clone).attr(domAttribute.name, domAttribute.value);
                            }
                            
                            // Set the component as loaded.
                            $(clone).data("componentLoaded", true);
                            
                            return clone;
                        });
                    });
                } else {
                    return Future.fromResult(element);
                }
            });
        };
        
        var loadComponents = function (startElement) {
            var $startElement = $(startElement);
            $startElement.find("script").remove();
            return loadComponentsDeep(startElement).chain(function (lastElement) {
                
                $componentStyles.after(styleFragments);
                $startElement.replaceWith(lastElement);
                return loadControllers(lastElement).chain(function () {
                    return lastElement;
                });
            });
        };
        
        var initialize = function () {
            var rootComponentFutures = [];
            
            var $starts = $("[component], [controller], [apply]").filter(function () {
                return $(this).parents("[component], [controller], [apply]").length === 0;
            });
            
            $starts.each(function () {
                rootComponentFutures.push(loadComponents(this));
            });
            
            Future.all(rootComponentFutures).then(function () {
                $(document).triggerHandler({
                    type: "componentsReady"
                });
            });
        };
        
        
        self.load = function (element) {
            if ($(element).closest("body").length === 0) {
                throw new Error("Loading components relies on the element be part of the document.");
            }
            
            return loadComponents.apply(null, arguments).try();
        };
        
        self.createComponentAsync = function (url, content, attributes) {
            var div = document.createElement("div");
            $(div).attr(attributes || {}).attr("component", url);
            
            if (typeof content !== "undefined") {
                $(div).append($(content));
            }
            
            return loadComponents(div);
        };
        
        self.createComponent = self.createComponentAsync;
        
        self.replaceElementWithAsync = function (element, url) {
            $(element).attr("component", url);
            return self.load(element);
        };
        
        self.replaceElementWith = function () {
            return self.replaceElementWithAsync().try();
        };
        
        self.getComponentConfigFuture = function () {
            return globalConfigFuture;
        };
        
        self.getComponentCache = function () {
            return componentCache;
        };
        
        self.addService = function (name, service) {
            services.add(name, service);
        };
        
        self.removeService = function (name) {
            return services.remove(name);
        };
        
        Object.keys(servicesHash).forEach(function (key) {
            services.add(key, servicesHash[key]);
        });
        
        initialize();
    };

});