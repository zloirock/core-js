import _at from "@core-js/pure/actual/instance/at";
var _ref;
// TS class with a setter-only property `buffer` - reading `s.buffer` has no statically
// resolvable type (no getter declared). plugin cannot determine the receiver type for
// `.at(0)` and falls back to the generic instance-method polyfill
declare class Sink {
  set buffer(_b: number[]);
}
declare const s: Sink;
_at(_ref = s.buffer).call(_ref, 0);