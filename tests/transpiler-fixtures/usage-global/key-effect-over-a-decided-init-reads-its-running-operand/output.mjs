import "core-js/modules/es.symbol.constructor";
import "core-js/modules/es.symbol.description";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.promise.constructor";
import "core-js/modules/es.promise.catch";
import "core-js/modules/es.promise.finally";
import "core-js/modules/es.promise.try";
import "core-js/modules/es.array.from";
import "core-js/modules/es.array.push";
import "core-js/modules/es.string.iterator";
// a computed key consuming the whole declaration over a selection the build decides reads as over the
// operand that runs: usage-global loads the key's static off that operand and nothing off the arm that never
// runs; a decided `&&` yields its right as a ternary does, its falsy left naming no module either way
export const log = [];
export const {
  [(log.push('from'), 'from')]: from
} = typeof Symbol != 'undefined' ? Array : Iterator;
export const {
  [(log.push('try'), 'try')]: attempt
} = typeof Symbol != 'undefined' && (log.push('init'), Promise);