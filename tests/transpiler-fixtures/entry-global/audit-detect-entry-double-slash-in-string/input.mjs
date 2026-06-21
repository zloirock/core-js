// `//` inside a single-quoted string literal must NOT trigger ASI guard's backward
// line-comment detection. a naive scan mismatched `//` inside `'https://...'` as a
// line-comment, walked past the preceding `;`, and injected a spurious `;` before
// `(arr)()` / `[arr]` / similar ASI-hazard tokens.
var x = 'https://example.com';
import 'core-js/actual/array/from';
[arr]()
