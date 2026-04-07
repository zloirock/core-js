var _ref;
import _atMaybeString from "@core-js/pure/actual/string/instance/at";
interface Dict {
  get(key: 'a'): string;
  get(key: 'b'): number;
}
declare const d: Dict;
_atMaybeString(_ref = d.get('a')).call(_ref, 0);