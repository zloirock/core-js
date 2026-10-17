import "core-js/modules/es.array.includes";
import "core-js/modules/es.string.includes";
let instanceField = "s";
class WithField {
  held = instanceField.includes(1);
}
instanceField = [];
export const e = new WithField();