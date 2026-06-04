import _Array$of from "@core-js/pure/actual/array/of";
import _Iterator from "@core-js/pure/actual/iterator/constructor";
// the IIFE is called with a classifiable receiver, so the member wrapper-default never fires;
// the polyfill must be synthesised onto the live caller-arg, leaving the default untouched
(function ({
  of
} = _Iterator) {
  return of(1);
})({
  of: _Array$of
});