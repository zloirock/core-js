import "core-js/modules/es.array.push";
import "core-js/modules/es.global-this";
import "core-js/modules/web.self";
// An ordinary unbacked navigation keeps the established realm-collapse spelling.
// Unlike a mutation host, its optional tail may fold onto the backed self.
export function read(effects) {
  return (effects.push("prefix"), globalThis.self.window)?.window.slotD;
}