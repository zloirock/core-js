import _at from "@core-js/pure/actual/instance/at";
var _ref;
// setter-only property read: findTypeMember's setter `break` lets iteration fall through
// without a match, so the class member lookup yields no type. `.at` lands on `desc.common`
// -> generic variant (matching the generic fallback for unknown-receiver type anywhere else)
declare class Sink {
  set buffer(_b: number[]);
}
declare const s: Sink;
_at(_ref = s.buffer).call(_ref, 0);