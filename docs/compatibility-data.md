# Compat data
`core-js` project provides (as [`core-js-compat`](/packages/core-js-compat) package) all required data about the necessity of `core-js` modules, entry points, and tools for work with it - it's useful for integration with tools like `babel` or `swc`. If you wanna help, you could take a look at the related section of [`CONTRIBUTING.md`](/CONTRIBUTING.md#how-to-update-core-js-compat-data). The visualization of compatibility data and the browser tests runner is available [here](http://zloirock.github.io/core-js/compat/), the example:

![compat-table](https://user-images.githubusercontent.com/2213682/180694428-856bcd0f-cab3-446f-be1a-2f669614dcc0.png)

# Supported engines
**Tested in:**
- Chrome 26+
- Firefox 4+
- Safari 5+
- Opera 12+
- Internet Explorer 8+ (sure, IE8 with ES3 limitations; IE7- also should work, but no longer tested)
- Edge
- Android Browser 2.3+
- iOS Safari 5.1+
- PhantomJS 1.9+
- NodeJS 0.8+
- Deno 1.0+
- Rhino 1.7.14+

...and it doesn't mean `core-js` will not work in other engines, they just have not been tested.
