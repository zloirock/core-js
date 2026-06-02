import _at from "@core-js/pure/actual/instance/at";
var _ref;
// symbol-only index signature, accessed by a NON-NUMERIC string key: a symbol index signature is
// never selectable by a string / number property key, so the resolver returns no member (TS itself
// rejects the access). the call falls back to the generic receiver-agnostic `_at` instead of
// over-emitting the array variant from the symbol signature's value type
interface Bag {
  [k: symbol]: number[];
}
declare const x: Bag;
_at(_ref = x['fallback']).call(_ref, 0);