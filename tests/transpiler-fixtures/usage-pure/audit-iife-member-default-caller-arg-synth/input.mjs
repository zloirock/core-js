// the IIFE is called with a classifiable receiver, so the member wrapper-default never fires;
// the polyfill must be synthesised onto the live caller-arg, leaving the default untouched
(function ({ of } = globalThis.Iterator) {
  return of(1);
})(Array);
