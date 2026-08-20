import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
var _ref;
// `new` discards a PRIMITIVE return and yields a fresh object, so a callee whose declared return
// is a primitive gives the construct nothing polyfillable - whichever lane resolved that return.
// the rule belongs to the call kind, not to the shape of the resolved callee, or an ambient head
// and a member call-signature walk past it. the last row is the control: a construct SIGNATURE
// declares the instance type rather than returning it, so it keeps narrowing
declare function makeAmbient(): string;
export const a = new makeAmbient().at(0);
interface Factory {
  make(): string;
}
declare const factory: Factory;
export const b = new factory.make().at(0);
declare const Ctor: new () => number[];
export const c = _atMaybeArray(_ref = new Ctor()).call(_ref, 0);