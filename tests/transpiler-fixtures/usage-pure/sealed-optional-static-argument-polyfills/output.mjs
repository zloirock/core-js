import _JSON$parse from "@core-js/pure/actual/json/parse";
import _Object$keys from "@core-js/pure/actual/object/keys";
export function parseWithReviver(text, reviver) {
  return _JSON$parse(text, reviver);
}
export const keys = _Object$keys('ab');