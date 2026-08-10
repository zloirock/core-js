import "<CWD>/packages/core-js/modules/es.object.to-string.js";
import "<CWD>/packages/core-js/modules/es.array.iterator.js";
import "<CWD>/packages/core-js/modules/es.string.repeat.js";
import "<CWD>/packages/core-js/modules/es.array.includes.js";
import "<CWD>/packages/core-js/modules/es.function.name.js";
import "<CWD>/packages/core-js/modules/es.global-this.js";
import "<CWD>/packages/core-js/modules/es.iterator.constructor.js";
import "<CWD>/packages/core-js/modules/es.map.constructor.js";
import "<CWD>/packages/core-js/modules/es.map.species.js";
import "<CWD>/packages/core-js/modules/es.map.get-or-insert.js";
import "<CWD>/packages/core-js/modules/es.map.get-or-insert-computed.js";
import "<CWD>/packages/core-js/modules/es.number.max-safe-integer.js";
import "<CWD>/packages/core-js/modules/es.number.to-fixed.js";
import "<CWD>/packages/core-js/modules/es.string.includes.js";
import "<CWD>/packages/core-js/modules/es.string.iterator.js";
import "<CWD>/packages/core-js/modules/esnext.iterator.includes.js";
import "<CWD>/packages/core-js/modules/web.dom-collections.iterator.js";
import "<CWD>/packages/core-js/modules/web.self.js";
// the proxy root stays visitable only while the emitted text still carries it RAW. every render
// that spells the root itself - a paren-sealed guard test, a chain-assign whose hops the guard
// collapsed, an alias chain a ctor-static claim erases - owns that substitution, and a rewrite
// left queued on the deleted spelling has nowhere to compose. the last two rows are the negative:
// there the guard memo re-emits the root verbatim, so its own rewrite must stay live
const alias = globalThis;
let assigned, kept, mid;
export const sealedRoot = globalThis?.window?.Array.prototype.includes.call([1], 1);
export const collapsedHops = (assigned = globalThis.self.window)?.Number.MAX_SAFE_INTEGER.toFixed(1);
export const collapsedStatic = (kept = globalThis.self.window)?.Map.length;
export const aliasCtorStatic = alias.self.Number.MAX_SAFE_INTEGER.toFixed(1);
export const rawGuardMemo = globalThis.baz?.name.includes('z');
export const rawMidHop = (mid = globalThis).baz?.name.includes('y');