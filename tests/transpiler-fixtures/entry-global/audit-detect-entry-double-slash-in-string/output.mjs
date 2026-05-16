import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.from";
import "core-js/modules/es.string.iterator";
// `//` inside a single-quoted string literal must NOT trigger ASI guard's backward
// line-comment detection. before the fix `prevSignificantPos` used naive
// `src.indexOf('//', lineStart)` which mismatched `//` inside `'https://...'` as a
// line-comment, walked past the preceding `;`, and injected spurious `;` before
// `(arr)()` / `[arr]` / similar ASI-hazard tokens.
var x = 'https://example.com';
[arr]();