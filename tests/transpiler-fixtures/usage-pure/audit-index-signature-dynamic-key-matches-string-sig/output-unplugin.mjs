import _atMaybeString from "@core-js/pure/actual/string/instance/at";
var _ref;
// `o[k]` with a string key selects the matching string index signature (string), not the first
// (symbol) signature - the dynamic computed-key path must be key-type aware like the static one
declare const o: { [k: symbol]: string[]; [k: string]: string };
declare const k: string;
_atMaybeString(_ref = o[k]).call(_ref, 0);