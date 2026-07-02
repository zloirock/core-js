# Supported engines and compatibility data

Starting from version 4, `core-js` drops support for ancient engines and focuses on environments with at least IE11-level JavaScript features (approximately ES5 + some additions). Older platforms - such as IE10 and below, Android 4.4.3 and below, PhantomJS, Opera Presto, and similar legacy engines - are no longer supported. If you still need to support such legacy browsers, please continue using `core-js` version 3.

The baseline is engines about IE11, ES5 with some additions:
- Basic `WeakMap` support (no matter bugs, for internal usage only, in polyfills could be fixed)
- Basic `Map` and `Set` support (no matter bugs, for internal usage only, in polyfills could be fixed or completely replaced)
- Basic `%TypedArray%`, `ArrayBuffer` and `DataView` constructors support (no matter bugs, in polyfills could be fixed)
- A way setting of a prototype - `Object.setPrototypeOf` or `__proto__`

Examples of supported engines:
- IE11
- Chrome 38
- Safari 7.1
- FF15
- Node 0.11

`core-js` provides (as [`@core-js/compat`](https://github.com/zloirock/core-js/tree/v4/packages/core-js-compat) package) all required data about the necessity of `core-js` modules, entry points, and tools for work with it - it's useful for integration with tools like `babel` or `swc`. If you wanna help, you could take a look at the related section of [`CONTRIBUTING`](contributing#h-how-to-update-core-js-compat-data). The visualization of compatibility data and the browser tests runner is available [here](http://zloirock.github.io/core-js/v4/compat/), the example:

![compat-table](https://user-images.githubusercontent.com/2213682/217452234-ccdcfc5a-c7d3-40d1-ab3f-86902315b8c3.png)
