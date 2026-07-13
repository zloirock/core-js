import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
import _globalThis from "@core-js/pure/actual/global-this";
import _self from "@core-js/pure/actual/self";
var _ref6, _ref7, _ref8, _ref9;
// `_ref` is read as an undeclared global (set on globalThis). plugin's ref allocator
// must account for such sloppy globals so its generated ref names don't collide - the
// user's global write must be treated as a reservation even though there's no local
// `_ref` binding declaration
_globalThis._ref = {
  x: 5
};
console.log(_ref.x);
_atMaybeArray(_ref6 = [1, 2, 3]).call(_ref6, 0);
// a READ-only slot key reserves the name the same way - the temp must not alias it
console.log(_globalThis._ref2);
// a STRING-key write has no member spelling for the key scan; the mutated-slot names
// still reserve it
Object.defineProperty(_self, '_ref3', {
  value: 1
});
export const f = _flatMaybeArray(_ref7 = [4, [5]]).call(_ref7);
// a proxy-HOP spelling names the same user slot through the alias - reserved the same way
console.log(_globalThis._ref4);
export const g = _atMaybeArray(_ref8 = [6, 7]).call(_ref8, -1);
// a computed STRING-key spelling folds to the same slot name - reserved too
console.log(_globalThis['_ref5']);
export const h = _flatMaybeArray(_ref9 = [8, [9]]).call(_ref9, 2);