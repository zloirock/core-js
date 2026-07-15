import _includesMaybeArray from "@core-js/pure/actual/array/instance/includes";
import _at from "@core-js/pure/actual/instance/at";
// flattening expands a shared union declaration once and lets each reference apply its OWN type
// arguments to the result, so two references to one generic union are the same expansion but not the
// same types. a branch is dropped as a duplicate only when it comes out as the very same node, which
// is exactly when no argument distinguished it. collapsing them earlier - before the arguments land -
// would silently delete the arm that disagrees and leave a union looking uniform, so a type-specific
// helper would be emitted for a receiver the source says is a string
type Pair<T> = {
  kind: "a";
  v: T;
} | {
  kind: "b";
  v: string;
};

declare const disagreeing: Pair<string[]> | Pair<string>;
declare const agreeing: Pair<string[]> | Pair<string[]>;

// the two references disagree on the argument, so the proven arm carries both an array and a string
// and stays unknowable - the generic helper is the only sound one, both legs present
export function referencesDisagreeOnTypeArgs() {
  if (disagreeing.kind === "a") { var _ref; return _at(_ref = disagreeing.v).call(_ref, 0); }
  return "";
}

// the two references agree, so the proven arm is an array on every path and the narrow holds
export function referencesAgreeOnTypeArgs() {
  if (agreeing.kind === "a") { var _ref2; return _includesMaybeArray(_ref2 = agreeing.v).call(_ref2, "x"); }
  return false;
}