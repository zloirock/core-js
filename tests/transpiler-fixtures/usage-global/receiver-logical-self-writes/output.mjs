import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.includes";
import "core-js/modules/es.iterator.constructor";
import "core-js/modules/es.iterator.includes";
import "core-js/modules/es.string.includes";
// Repeated logical assignments keep all possible receiver families.
let value = input;
value = value || first;
value = value || second;
value = value || third;
export const result = value.includes(7);