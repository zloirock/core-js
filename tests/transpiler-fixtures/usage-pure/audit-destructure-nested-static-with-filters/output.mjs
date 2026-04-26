import _Object$defineProperty from "@core-js/pure/actual/object/define-property";
// nested destructure where filters are applied inside a static-method call: the
// filters/transforms must not break the polyfill rewrite.
const defineProperty = _Object$defineProperty;
defineProperty({}, 'x', {
  value: 42
});