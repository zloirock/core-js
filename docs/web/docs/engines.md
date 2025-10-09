# Supported engines and compatibility data

`core-js` tries to support all possible JS engines and environments with ES3 support. Some features have a higher lower bar - for example, *some* accessors can properly work only from ES5, promises require a way to set a microtask or a task, etc.

However, I have no possibility to test `core-js` absolutely everywhere - for example, testing in IE7- and some other ancient was stopped. The list of definitely supported engines you can see in the compatibility table by the link below. [Write](https://github.com/zloirock/core-js/issues) if you have issues or questions with the support of any engine.

`core-js` project provides (as [`core-js-compat`](https://github.com/zloirock/core-js/tree/master/packages/core-js-compat) package) all required data about the necessity of `core-js` modules, entry points, and tools for work with it - it's useful for integration with tools like `babel` or `swc`. If you wanna help, you could take a look at the related section of [`CONTRIBUTING`](contributing#h-how-to-update-core-js-compat-data). The visualization of compatibility data and the browser tests runner is available [here](https://zloirock.github.io/core-js/master/compat/), the example:

![compat-table](https://user-images.githubusercontent.com/2213682/217452234-ccdcfc5a-c7d3-40d1-ab3f-86902315b8c3.png)
