import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.includes";
import "core-js/modules/es.iterator.constructor";
import "core-js/modules/es.iterator.includes";
import "core-js/modules/es.string.includes";
// A missing own slot can read an inherited value before its default is considered.
// Preserve both possible receiver families.
Object.prototype.typedDefaultValue = 'xy';
const {
  typedDefaultValue: value = [1]
} = {};
export const result = value.includes('xy');