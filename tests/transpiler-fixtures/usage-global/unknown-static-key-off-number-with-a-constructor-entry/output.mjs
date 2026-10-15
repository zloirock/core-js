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
// An unknown key can select any own static of a constructor with a global module.
// Global usage loads its constructor and statics, without unrelated prototype methods.
// Pure keeps the unknown read native.
export function read(key) {
  return Number[key];
}