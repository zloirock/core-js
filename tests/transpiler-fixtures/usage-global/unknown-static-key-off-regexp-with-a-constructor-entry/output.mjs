import "core-js/modules/es.string.repeat";
import "core-js/modules/es.string.pad-start";
import "core-js/modules/es.global-this";
import "core-js/modules/es.regexp.constructor";
import "core-js/modules/es.regexp.escape";
import "core-js/modules/es.regexp.dot-all";
import "core-js/modules/es.regexp.exec";
import "core-js/modules/es.regexp.sticky";
// An unknown key can select any own static of a constructor with a global module.
// Global usage loads its constructor and statics, without unrelated prototype methods.
// Pure keeps the unknown read native.
export function read(key) {
  return globalThis.RegExp[key];
}