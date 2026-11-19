import _Array$from from "@core-js/pure/actual/array/from";
import _Array$of from "@core-js/pure/actual/array/of";
import _globalThis from "@core-js/pure/actual/global-this";
import _Object$assign from "@core-js/pure/actual/object/assign";
import _self from "@core-js/pure/actual/self";
// A sealed receiver throws before the static key and argument are evaluated.
// An open chain skips both; a call outside its seal still evaluates its argument.
export function sealed(mark) {
  return ((null == _globalThis.window ? void 0 : _self).Array, mark('key'), _Array$from)(mark('argument'));
}
export function open(mark) {
  return null == _globalThis.window ? void 0 : (mark('key'), _Array$of(mark('argument')));
}
export function call(mark) {
  return (null == _globalThis.window ? void 0 : _Object$assign)(mark('argument'));
}
export function sealedKey(mark) {
  return ((null == _globalThis.window ? void 0 : _self).self, _self)[mark('key'), 'guardBoundaryAbsent'];
}
export function optionalReader(mark) {
  return ((null == _globalThis.window ? void 0 : _self).self, _self)[mark('key'), 'guardBoundaryAbsent'];
}
export function deepReader(mark) {
  return ((null == _globalThis.window ? void 0 : _self).self, _self)[mark('key'), 'guardBoundaryAbsent'];
}
export function windowReader(mark) {
  return (null == _globalThis.window ? void 0 : _self).window?.[mark('key'), 'guardBoundaryAbsent'];
}
export function storedReader(mark, held) {
  return ((null == (held = _globalThis.window) ? void 0 : _self).self, _self)[mark('key'), 'guardBoundaryAbsent'];
}
export function callRootReader(mark) {
  return ((null == (() => _globalThis)().window ? void 0 : _self).self, _self)[mark('key'), 'guardBoundaryAbsent'];
}