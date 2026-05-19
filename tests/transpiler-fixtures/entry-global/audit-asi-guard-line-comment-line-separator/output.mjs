import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.from";
import "core-js/modules/es.string.iterator";
// the line comment after the entry import terminates with U+2028 (LINE SEPARATOR)
// instead of LF. `skipGap` must treat U+2028 as a LineTerminator so the boundary scan
// stops at the comment edge and sees the `(` hazard char on the next visual line;
// without that, the `;` injection is skipped and the cosmetic source layout fuses
var x = 1;
//c
foo();