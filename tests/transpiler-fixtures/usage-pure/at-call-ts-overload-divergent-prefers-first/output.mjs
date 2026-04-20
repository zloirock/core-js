import _atMaybeString from "@core-js/pure/actual/string/instance/at";
var _ref;
interface Dict {
  get(key: 'a'): string;
  get(key: 'b'): number;
}
declare const d: Dict;
_atMaybeString(_ref = d.get('a')).call(_ref, 0);