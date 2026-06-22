import _Symbol$iterator from "@core-js/pure/actual/symbol/iterator";
import _Symbol$toStringTag from "@core-js/pure/actual/symbol/to-string-tag";
// Excluding the iterator helpers means `obj[Symbol.iterator]` can't collapse to `_getIteratorMethod`. The
// emitter must then leave the `Symbol.iterator` KEY for the regular static-symbol rewrite, so the computed
// key `globalThis.Symbol.iterator` resolves to the imported `_Symbol$iterator` (always defined - the pure
// variant installs nothing on the global). Skipping the key BEFORE the entry-availability bail stranded a
// raw `globalThis` / left a broken `_globalThis.Symbol.iterator` (`_globalThis.Symbol` is undefined under
// pure, ie:11 throw). A second proxy-global symbol read (`self.Symbol`) keeps it honest across aliases
let obj = {};
const it = obj[_Symbol$iterator];
const tag = obj[_Symbol$toStringTag];
export { it, tag };