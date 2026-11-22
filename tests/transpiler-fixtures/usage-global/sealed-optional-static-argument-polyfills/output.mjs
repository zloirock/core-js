import "core-js/modules/es.object.keys";
import "core-js/modules/es.json.parse";
export function parseWithReviver(text, reviver) {
  return (JSON?.parse)(text, reviver);
}
export const keys = (Object?.keys)('ab');