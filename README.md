[[Category:BASE]]
BASE.require is a namespace-driven system for lazily managing dependencies at run-time.

Old HTML files became almost unmanageable when it came to script dependencies, and their order. When javascript files were broken out into small snippets of reusable code the HTML pages became harder and harder to maintain. With this problem in mind BASE.require was born.

BASE.require will load dependencies based off of namespace before executing the callback function. It will do this recursively until there are no more scripts to load. The scripts will then be executed in the order in which their dependencies were loaded. For Example I may need Employee.js but that file depends on Person.js. Since Person.js doesn't depend on anything it's script is executed and the Person namespace is declared which then triggers a sweep in BASE.require to see if anything depended on it. It will find that Employee.js depended on this namespace and this namespace alone, so it will then call the callback where Employee is declared.

Person.js
<pre class="prettyprint linenums">
var Person = function(){
    this.firstName = null;
    this.lastName = null;
};
</pre>

Employee.js
<pre class="prettyprint linenums">

BASE.require(["Person"], function(){

    var Employee = function(){
        Person.apply(this);
    };
    Empolyee.prototype = new Person();
    Employee.prototype.constructor = Employee;

});
</pre>

index.html
<pre class="prettyprint linenums">
<!DOCTYPE html>
<html>
<head></head>
<body>
    <script src="BASE.js" ></script>
    <script>
        BASE.require(["Employee"], function(){
            var emp = new Employee();
            emp.firstName = "Jared";
            emp.lastName = "Barnes";
        });
    </script>
</body>
</html>
</pre>

The exmaple provided above would assume that you had a directory structure like this:
<pre >
index.html
BASE.js
Person.js
Employee.js
</pre>
Now you may not want to have all your Javascript files in your root directory.
You may want it to look like this.
<pre>
index.html
scripts
   |
   -> BASE.js
      Person.js
      Employee.js
</pre>
All you would need to do is to set some configurations.
<pre class="prettyprint linenums">
<!DOCTYPE html>
<html>
<head></head>
<body>
    <script src="BASE.js" ></script>
    <script>
        BASE.require.loader.setRoot("/scripts");
        BASE.require(["Employee"], function(){
            var emp = new Employee();
            emp.firstName = "Jared";
            emp.lastName = "Barnes";
        });
    </script>
</body>
</html>
</pre>

That was definitely a step in the right direction, but then you notice that you may want to have these objects in a deeper namespace. This is where BASE.require really shines. Lets suppose that you want the Person and the Employee objects to be in the namespace of LG.dataModel. All you would need to do is to make a directory structure to resemble your namespace. So LG.dataModel would really be translated into /scripts/LG/dataModel. With that in mind you can now make a structure like this.

<pre>
index.html
scripts 
    |
     -> BASE.js
        LG
         |
          -> dataModel
               |
                -> Person.js
                   Employee.js

</pre>

Now here is what your configurations would look like now. 
NOTE: Your namespaces on your Person.js file and your Employee.js file would need to be declared with the namespace LG.dataModel.Person and LG.dataModel.Employee to work.
<pre class="prettyprint linenums">
<!DOCTYPE html>
<html>
<head></head>
<body>
    <script src="BASE.js" ></script>
    <script>
        BASE.require.loader.setRoot("/scripts");
        BASE.require(["LG.dataModel.Employee"], function(){
            var emp = new LG.dataModel.Employee();
            emp.firstName = "Jared";
            emp.lastName = "Barnes";
        });
    </script>
</body>
</html>
</pre>

===Namespaces and Directory Structure===
A script loader needs to know where to find scripts to load.  AMD-style loaders, such as Require.js and node.js require() will look in a modules folder ("node_modules" for node.js), where each module is represented.  BASE.require is different - being namespace-driven, it expects scripts to be arranged more like Java packages.

In the example above, when BASE.require is asked for "LG.dataModel.Employee", this is what happens:
* BASE.require starts at the defined "root".  In this case, "/scripts".
* The loader then explodes the name of the requested object on periods and turns that into a directory path to an object, and adds it to the root.  The directory becomes "/scripts/LG/dataModel". The file that will be loaded is the last part of the requested name, plus ".js".  All told, BASE.require will try to load a file at "/scripts/LG/dataModel/Employee.js".  This is done by adding a <code><script></code> tag to the HEAD of the document when in a browser, and by <code>require(path)</code> when in node.js.
* If the file doesn't load, a 404 is thrown in the browser console, or similar error in node.js.
At this point, BASE.require <strong>is not</strong> done, even if the file loads successfully.  The number one frustration with BASE.require is a misunderstanding of what happens (or often doesn't happen) next.
* Even if the script loads successfully, BASE.require will only fire the callback if the requested namespace has been fulfilled.  In this case, the script at "/scripts/LG/dataModel/Employee.js" MUST define a <code>LG.dataModel.Employee</code> object on the global object.  If it doesn't, your program will just sit around, error-less, and you won't know why.

On that note, here's a trick - to check for a broken require dependency, run this in the console:
<code>BASE.require.sweeper.getStatus()</code>
It will give you a very helpful map of the unsatisfied requirements.  The last one in the list is most likely where the problem is.

===Other configs===
What if you don't want to put all your scripts in the same folder, or you are drawing from multiple libraries in multiple locations?
BASE.require has a few other configuration options you should know about:
* <code>BASE.require.loader.setNamespace("other.library", "path/to/namespace/root");</code> sets a different root for the specified namespace.  The object "other.library.tools.Hammer" will be expected at "path/to/namespace/root/tools.Hammer.js"
* <code>BASE.require.loader.setObject("objectName", "path/to/object");</code> will load the specified path when the given object name is required.  It skips the namespace pathing.


==Examples==
This example ensures that the <code>forEach</code> method is available on the Array prototype, then executes the function in the 2nd argument.  For browsers which have the method built-in, BASE.require runs the callback right away, but in older browsers without native <code>forEach</code> support, BASE.require will attempt to load the polyfill before executing the callback.
<pre class="prettyprint linenums">
BASE.require([
  "Array.prototype.forEach"
], function(){
  var a = [1, 2, 3, 4, 5];
  a.forEach(function(item){
    console.log(item);
  });
});
</pre>
