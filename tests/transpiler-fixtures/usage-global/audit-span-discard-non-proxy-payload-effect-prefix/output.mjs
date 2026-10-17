import "<CWD>/packages/core-js/modules/es.array.of.js";
import "<CWD>/packages/core-js/modules/es.global-this.js";
import "<CWD>/packages/core-js/modules/web.self.js";
function eff() {
  return 0;
}
// the receiver an emit RE-EMITS keeps its own rewrites: a harvested effect rides ahead of the
// binding, so the read inside it still resolves
export const effectPrefix = (eff(), globalThis).self.Array.of(4);