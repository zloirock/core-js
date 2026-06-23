import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.from";
import "core-js/modules/es.string.iterator";
// trailing /* block comment */ chain BEFORE the removed import. backward-scan must
// peel through both block-comment and line-comment forms when deciding ASI guard:
// stopping at `*/` boundary instead of the preceding `;` would mistakenly think the
// previous statement was unterminated and inject a spurious `;` before `[arr]()`.
var x = 1; /* trailing block */ // and a line
[arr]()