BASE.require([
    "jQuery",
    "Array.prototype.forEach",
    "String.prototype.trim",
    "BASE.async.Future",
    "BASE.async.Task",
    "BASE.async.Continuation",
    "JSON",
    "BASE.util.Guid",
    "jQuery.fn.on",
    "bowser"
], function () {

    BASE.namespace("BASE.web.components");

    var Future = BASE.async.Future;
    var Task = BASE.async.Task;
    var Continuation = BASE.async.Continuation;
    var Guid = BASE.util.Guid;
    var globalConfig = {
        aliases: {}
    };
    var global = (function () { return this; }());
    var isHTML4 = (function () {
        if ('querySelector' in document && 'localStorage' in global && 'addEventListener' in global) {
            return false;
        } else {
            return true;
        }
    }());

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
                return value + "/" + nextUrl
            } else {
                return nextUrl;
            }

        }, "");
    };

    var style = document.createElement('style');
    var $componentStyles = $(style).data("components", {});
    style.setAttribute("type", "text/css");
    $("head").prepend(style);

    $.fn.scope = function (name, newValue) {
        var isGetter = arguments.length === 1;
        var $this = $(this[0]);

        var scope = $this.data("__scope__");
        if (!scope) {
            scope = {};
            $this.data("__scope__", scope);
        }

        if (isGetter) {

            var value = scope[name];

            if (typeof value === "undefined" && $this.parent().length > 0) {
                return $this.parent().scope(name);
            }

            return value;
        } else {
            scope[name] = newValue;
            return this;
        }
    };

    $.fn.scopeSetter = function (name) {
        var $this = $(this[0]);

        var scope = $this.data("__scope__");
        if (!scope) {
            scope = {};
            $this.data("__scope__", scope);
        }

        var value = scope[name];

        if (typeof value === "undefined" && $this.parent().length > 0) {
            return $this.parent().scopeSetter(name);
        }

        return $this.parent().controller();
    };

    $.fn.tags = function () {
        var $this = $(this[0]);
        return $this.data("tags");
    };

    var Scope = function ($element) {
        this.get = function (name) {
            return $element.scope(name);
        };

        this.set = function (name, value) {
            return $element.scope(name, value);
        };
    };

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
        var alias = aliasObject.default;

        if (typeof alias !== "string") {
            throw new Error("There needs to be a default alias.");
        }

        // The reason we use an every here is so that when we have a match we exit the loop.
        for (var x = 0 ; x < exceptions.length; x++) {
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
        return new BASE.async.Future(function (setValue, setError) {
            if (url) {
                jQuery.ajax({
                    url: url,
                    type: "GET",
                    dataType: "json",
                    success: function (obj) {
                        obj.root = root;
                        fixConfigBasedOnBrowser(obj);
                        setValue(obj);
                    },
                    error: function () {
                        setError(new Error("Error while trying to retrieve url: " + url));
                    }
                });
            } else {
                setValue({
                    aliases: {}
                });
            }
        });
    };

    var getConfigInElement = function (elem) {
        var configs = $(elem).find("script[type='components/config']");
        var task = new BASE.async.Task();

        // This will run once to get the global config, so we don't want to include it on the first go around.
        if (typeof globalConfigFuture !== "undefined") {
            task.add(globalConfigFuture);
        }

        configs.each(function () {
            var $config = $(this);
            var root = $config.attr("root") || undefined;

            var url = $config.attr("src");
            if (!url) {
                try {
                    var configObj = JSON.parse($config.html())
                    configObj.root = root;
                    task.add(Future.fromResult(configObj));
                } catch (e) {
                    task.add(Future.fromError(e));
                }
            } else {
                task.add(getConfig(url, root));
            }
        });

        return new Future(function (setValue, setError) {
            task.start().whenAll(function (futures) {
                var concatConfig = globalConfig;
                var error = null;

                futures.forEach(function (future) {
                    if (future.error === null) {
                        var config = future.value;
                        Object.keys(config.aliases).forEach(function (key) {
                            var root = config.root || "";
                            concatConfig.aliases[key] = concatPaths(root, config.aliases[key]);
                        });
                    } else {
                        error = future.error;
                    }
                });

                if (error) {
                    setError(error);
                } else {
                    setValue(concatConfig);
                }

            });
        });
    };

    var globalConfigFuture = getConfigInElement($("head")[0]);

    var HtmlCache = function () {
        var self = this;
        var cache = {};

        var ifError = function (e) {
            throw e;
        };

        self.addComponentHtml = function (url, html) {
            cache[url] = Future.fromResult(html);
        }

        self.getComponentHtml = function (url) {
            if (cache[url]) {
                return cache[url];
            } else {
                return cache[url] = new Future(function (setValue, setError) {
                    jQuery.ajax({
                        url: url,
                        type: "GET",
                        dataType: "html",
                        success: function (html) {
                            setValue(html);
                        },
                        error: function () {
                            setError(new Error("Error while trying to retrieve url: " + url));
                        }

                    });
                }).ifError(ifError);
            }
        };

    };

    var hasImport = function (text) {
        return text.indexOf("@import") >= 0;
    };

    var $head = $("head");

    // TODO: Blake had a good idea to move all the @ directives into one style sheet.
    // This would save us from hitting the threshold in IE with their stylesheet limit.
    var appendStyle = function (text) {
        var style = $componentStyles[0];
        var css;
        var textnode;

        if (text) {
            if (isHTML4) {   // Old IE
                css = style.styleSheet.cssText || '';
                css += text;
                style.styleSheet.cssText = css;
            } else {// the world
                var $styleSheet = $("<style type=\"text/css\"></style>");
                $styleSheet.text(text);
                $componentStyles.after($styleSheet);
            }
        }
    };

    var importRegEx = /@import url\(\"?(.*?)\"?\)\;/gi;

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
            var future;
            if (cache[url]) {
                future = cache[url];
            } else {
                future = cache[url] = new Future(function (setValue, setError) {
                    htmlCache.getComponentHtml(url).then(function (html) {
                        var $element = $(html);
                        var element = $element[0];

                        var task = new Task();
                        var guid = Guid.create();

                        $element.attr("cid", guid);

                        $element.find("[tag]").each(function () {
                            var $this = $(this);
                            var tagName = $this.attr("tag");
                            $this.attr("owner", guid);
                        });


                        $element.children().each(function () {
                            var oldElement = this;

                            task.add(loadComponentsDeep(oldElement).then(function (newElement) {
                                $(oldElement).replaceWith(newElement);
                            }));
                        });

                        task.start().whenAll(function (futures) {
                            handleStyles(url, $element);
                            if (element.tagName.toUpperCase() === "STYLE") {
                                setValue(document.createElement("STYLE"));
                            } else {
                                cache[url] = new Future.fromResult(element);
                                setValue(element);
                            }
                        });
                    });
                });
            }

            return future;
        };

        self.loadComponent = function (url, $withContent) {
            return new Future(function (setValue, setError) {
                self.getComponentTemplate(url).then(function (template) {
                    var element = $(template).clone()[0];// template.cloneNode(true);
                    var $element = $(element);

                    var $tempHolder = $(document.createElement("div"));
                    var callbacks = [];
                    // Fills the content tags with matching criteria.
                    var $contentTags = $element.find("embed").each(function () {
                        var $contentTag = $(this);
                        var selector = $contentTag.attr("select");
                        if (selector) {
                            // For some reason selectors don't work on document fragments.
                            // So we wrap it and do a search.

                            $withContent.appendTo($tempHolder);

                            $tempHolder.children(selector).each(function () {
                                var child = this;

                                if (!child.selected) {
                                    child.selected = true;
                                    callbacks.push(function () {
                                        $(child).remove().insertBefore($contentTag);
                                    });
                                }
                            });

                            $withContent = $tempHolder.contents();
                        } else {
                            callbacks.push(function () {
                                $withContent.insertBefore($contentTag);
                            });
                        }

                    });

                    callbacks.forEach(function (callback) { callback(); });
                    $contentTags.remove();


                    setValue(element);
                });
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

    var disallowedDiggers = "iframe, object, embed, [template]";

    var walkTheDomAsync = function (element, asyncOperation) {

        return new Future(function (setValue, setError) {
            var task = new Task();
            if (!$(element).is(disallowedDiggers)) {
                $(element).children().each(function () {

                    task.add(walkTheDomAsync(this, asyncOperation));
                });
            }
            task.start().whenAll(function (childrenFutures) {
                asyncOperation(element).then(setValue).ifError(setError);
            });
        });
    };

    var buildDomAsync = function (element, asyncOperation) {
        return new Future(function (setValue, setError) {
            var task = new Task();

            if (!$(element).is(disallowedDiggers)) {
                $(element).contents().each(function () {
                    var childElement = this;
                    task.add(buildDomAsync(childElement, asyncOperation));
                });
            }
            task.start().whenAll(function (childrenFutures) {
                asyncOperation(element).then(function (lastElement) {

                    if (lastElement !== element) {
                        $(element).replaceWith(lastElement);
                        setValue(lastElement);
                    } else {
                        setValue(element);
                    }

                }).ifError(setError);
            });
        });
    };

    var loadControllers = function (startElement) {

        return walkTheDomAsync(startElement, function (element) {
            return new Future(function (setValue, setError) {
                var $element = $(element);

                var controllerName = $element.attr("controller");
                var controllerFuture = BASE.async.Future.fromResult(null);

                // Instantiate the controller if applicable
                if (controllerName && !$element.data("controller")) {
                    $element.data("controller", "loading...");

                    var controllerFuture = new BASE.async.Future(function (setValue, setError) {
                        BASE.require([controllerName], function () {
                            var Controller = BASE.getObject(controllerName);
                            var tags = {};
                            var $component = $element.closest("[component]");
                            var guid = $component.attr("cid");

                            $component.find("[owner='" + guid + "']").each(function () {
                                var $this = $(this);
                                if ($this.closest("[cid='" + guid + "']")[0] === $component[0]) {
                                    tags[$this.attr("tag")] = this;
                                }
                            });

                            var scope = new Scope($element);

                            var instance = new Controller(element, tags, scope);


                            $element.data("controller", instance);
                            $element.data("tags", tags);
                            $element.data("scope", scope);

                            setValue(instance);

                        });
                    });
                }

                // When the controller is set up, apply behaviors if applicable
                var cont = new Continuation(controllerFuture).then(function (controller) {
                    controller = controller || {};
                    var applyList = $element.attr("apply");
                    if (applyList) {
                        var behaviors = applyList.split(";").map(function (b) { return b.trim(); });
                        BASE.require(behaviors, function () {
                            behaviors.forEach(function (b) {
                                var Behavior = BASE.getObject(b);
                                Behavior.call(controller, element);
                            });
                            setValue();
                        });
                    } else {
                        setValue();
                    }
                    return Future.fromResult(null);
                });


            });
        }, {});
    };

    var loadComponentsDeep = function (startElement) {
        var startElementClone = $(startElement).clone()[0];
        return new Future(function (setValue, setError) {
            buildDomAsync(startElementClone, function (element) {
                return new Future(function (setValue, setError) {
                    var $element = $(element);

                    var componentName = $element.attr("component");

                    // Make sure the component isn't loaded twice.
                    if (componentName && !$element.data("componentLoaded")) {
                        // We need to check the global aliases for a match.
                        globalConfigFuture.then(function (config) {
                            var aliases = config.aliases;
                            componentName = aliases[componentName] || componentName;

                            componentCache.loadComponent(componentName, $element.contents().remove()).then(function (clone) {
                                var domAttribute;
                                // Apply attributes that were on the previous element.
                                for (var x = 0 ; x < element.attributes.length; x++) {
                                    domAttribute = element.attributes.item(x);
                                    $(clone).attr(domAttribute.name, domAttribute.value);
                                }

                                // Set the component as loaded.
                                $(clone).data("componentLoaded", true);

                                setValue(clone);
                            });
                        }).ifError(function (error) {
                            console.error(error.message + ". Not found or parse error.");
                            setError(error);
                        });
                    } else {
                        setValue(element);
                    }
                });

            }).then(setValue);
        }).then();
    };

    var loadComponents = function (startElement) {
        $(startElement).find("script").remove();
        return new Future(function (setValue, setError) {

            loadComponentsDeep(startElement).then(function (lastElement) {
                $(startElement).replaceWith(lastElement);
                loadControllers(lastElement).then(function () {
                    setValue(lastElement);
                });
            });

        });
    };

    BASE.web.components.load = function (element) {
        if ($(element).closest("body").length === 0) {
            throw new Error("Loading components relies on the element be part of the document.");
        }

        return loadComponents.apply(null, arguments);
    };


    BASE.web.components.createComponent = function (url, content, attributes) {
        var div = document.createElement("div");
        $(div).attr(attributes || {}).attr("component", url);
        if (typeof content !== "undefined") {
            $(div).append($(content));
        }
        return loadComponents(div);
    };

    BASE.web.components.replaceElementWith = function (element, url) {
        $(element).attr("component", url);
        return BASE.web.components.load(element).then(function (lastElement) {

            $(lastElement).find("[component]").each(function () {
                $(this).triggerHandler({
                    type: "enteredView"
                });
            });

        });
    };

    BASE.web.components.getComponentConfigFuture = function () {
        return globalConfigFuture;
    };

    BASE.web.components.getComponentCache = function () {
        return componentCache;
    };

    document.createComponent = BASE.web.components.createComponent;

    Element.prototype.replaceWithComponent = function (url) {
        return BASE.web.components.replaceElementWith(this, url);
    };

    jQuery.prototype.controller = function () {
        return $(this[0]).data("controller");
    };

    $(function () {


        var task = new Task();

        var $starts = $("[component], [controller], [apply]").filter(function () {
            return $(this).parents("[component], [controller], [apply]").length === 0;
        });

        $starts.each(function () {

            task.add(loadComponents(this).then(function (lastElement) {
                $(lastElement).find("[component], [controller], [apply]").each(function () {
                    $(this).triggerHandler({
                        type: "enteredView"
                    });
                });
                $(lastElement).triggerHandler({
                    type: "enteredView"
                });
            }));

        });

        task.start().whenAll(function () {

            $(document).trigger({
                type: "componentsReady"
            });

        });

    });
});