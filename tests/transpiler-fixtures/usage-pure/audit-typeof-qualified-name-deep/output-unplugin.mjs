import _atMaybeString from "@core-js/pure/actual/string/instance/at";
// `typeof NS.Sub.value` - multi-level qualified-name type query. plugin walks the full
// annotation chain `NS.Sub.value` to pick up its `string` type, so `.at(0)` routes to
// the String-specific polyfill rather than a generic instance fallback
declare const NS: { Sub: { value: string } };
declare const s: typeof NS.Sub.value;
_atMaybeString(s).call(s, 0);