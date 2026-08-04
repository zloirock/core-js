import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _includesMaybeArray from "@core-js/pure/actual/array/instance/includes";
import _at from "@core-js/pure/actual/instance/at";
import _includesMaybeString from "@core-js/pure/actual/string/instance/includes";
// @flow
// Flow spellings of a user-defined structural Thenable. The peel used to accept only the TS
// node names, so every Flow file fell straight through and `await` narrowed nothing. Each
// positive arm uses a distinct method so the narrow is attributable: Array -> es.array.at,
// string -> es.string.includes, Array -> es.array.includes. The last arm is the negative: a
// `then` that is not a function type is not a Thenable, so the receiver stays unknown: the
// global flavor over-injects both `at` families, the pure one falls back to generic `at`.
class ClassThenable<T> {
  then: (cb: (v: T) => any) => ClassThenable<T>;
}
interface IfaceThenable<T> {
  then(cb: (v: T) => any): IfaceThenable<T>
}
type AliasThenable<T> = {
  then: (cb: (v: T) => any) => AliasThenable<T>
};
type NotThenable = {
  then: string
};
async function classProbe(a: ClassThenable<Array<number>>) {
  var _ref;
  _atMaybeArray(_ref = await a).call(_ref, -1);
}
async function ifaceProbe(b: IfaceThenable<string>) {
  var _ref2;
  _includesMaybeString(_ref2 = await b).call(_ref2, 'x');
}
async function aliasProbe(c: AliasThenable<Array<string>>) {
  var _ref3;
  _includesMaybeArray(_ref3 = await c).call(_ref3, 'x');
}
async function bailProbe(d: NotThenable) {
  var _ref4;
  _at(_ref4 = await d).call(_ref4, 0);
}
classProbe();
ifaceProbe();
aliasProbe();
bailProbe();