import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.at";
import "core-js/modules/es.array.includes";
import "core-js/modules/es.iterator.constructor";
import "core-js/modules/es.iterator.includes";
import "core-js/modules/es.string.at";
import "core-js/modules/es.string.includes";
// An arbitrary keyof can reach a symbol property outside the string index signature.
function f<T extends {
  [key: string]: string[];
}>(t: T, k: keyof T) {
  return t[k].at(0);
}
function g<T extends Record<string, string>>(t: T, k: keyof T) {
  return t[k].includes('a');
}
function bounded<T extends Record<PropertyKey, string>>(t: T, k: keyof T) {
  return t[k].includes('a');
}