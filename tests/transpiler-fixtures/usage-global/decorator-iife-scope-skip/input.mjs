// IIFE inside the decorator expression hides its `Promise` reference behind a function scope; the
// decorator itself still triggers the metadata polyfills required by stage-3 decorator support
@(function () { const Promise = MyPromise; return Promise; }())
class Foo {}
