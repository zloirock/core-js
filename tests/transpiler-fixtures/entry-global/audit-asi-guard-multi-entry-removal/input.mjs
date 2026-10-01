// Two consecutive entry-imports between an unterminated `var x = 1` and a leading-bracket
// statement: the trailing `;` of the earlier import lives in `ms.original` after removal,
// so the second removal's backward ASI scan must skip past the prior removed range -
// otherwise the prev-prev `;` masquerades as the active terminator and no guard is injected.
// Distinct entries (`from` vs `at`) make both removals contribute distinct imports.
var x = 1
import 'core-js/actual/array/from'
import 'core-js/actual/array/at'
[1, 2, 3].forEach(n => x = n)
