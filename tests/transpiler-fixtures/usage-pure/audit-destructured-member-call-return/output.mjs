import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
import _includesMaybeArray from "@core-js/pure/actual/array/instance/includes";
import _at from "@core-js/pure/actual/instance/at";
import _padStartMaybeString from "@core-js/pure/actual/string/instance/pad-start";
var _ref, _ref2, _ref3, _ref4, _ref5;
// a destructured name binds a MEMBER of its container, so the call lane has to descend the key
// path to reach the member's signature: handing back the container's own annotation leaves a
// destructured method with no return type at all, while the same method read as `i.m()` keeps it.
// the property line is the control - those already resolved, so the gap was the call half
interface Api {
  list(): number[];
  pick(x: number): number[];
  pick(x: string): string;
  text: () => string;
  xs: number[];
}
declare const api: Api;
declare const pair: [() => number[], string];
const {
  list,
  text
} = api;
const {
  xs
} = api;
const [made] = pair;
export const a = _atMaybeArray(_ref = list()).call(_ref, 0);
export const b = _padStartMaybeString(_ref2 = text()).call(_ref2, 2);
export const c = _flatMaybeArray(xs).call(xs);
export const d = _includesMaybeArray(_ref3 = made()).call(_ref3, 1);
// an OVERLOADED member has no single answer without the call site, and this lane resolves the NAME:
// picking a head would be a guess, so the read widens to the generic dispatch instead
export const e = _atMaybeArray(_ref4 = api.pick(1)).call(_ref4, 0);
const {
  pick
} = api;
export const f = _at(_ref5 = pick(1)).call(_ref5, 0);