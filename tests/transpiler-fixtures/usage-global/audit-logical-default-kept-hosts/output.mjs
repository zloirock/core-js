import "core-js/modules/es.string.repeat";
import "core-js/modules/es.number.constructor";
import "core-js/modules/es.number.epsilon";
import "core-js/modules/es.number.is-finite";
import "core-js/modules/es.number.is-integer";
import "core-js/modules/es.number.is-nan";
import "core-js/modules/es.number.is-safe-integer";
import "core-js/modules/es.number.max-safe-integer";
import "core-js/modules/es.number.min-safe-integer";
import "core-js/modules/es.number.parse-float";
import "core-js/modules/es.number.parse-int";
import "core-js/modules/es.number.to-exponential";
import "core-js/modules/es.number.to-fixed";
import "core-js/modules/web.self";
// the realm logical default claims only READ positions: a WRITE and a DELETE through the
// carrier inject nothing beyond the name's own module and the key-bias constructor row, a
// SHADOWED name is the user's binding, and `global` has no entry - no es.array.* static
// module joins the import set from these rows
(self ?? {}).Array = 1;
delete (self ?? {}).Number;
export function viaShadow(self) {
  return (self ?? {
    Number: {
      EPSILON: 0
    }
  }).Number.EPSILON;
}
export const viaGlobal = (global ?? {}).Number;