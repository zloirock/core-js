import "core-js/modules/es.array.at";
// The implicit patch read reuses the receiver evaluated before the key.
function read() {
  effect();
  return [];
}
export const method = read().at ||= fallback;