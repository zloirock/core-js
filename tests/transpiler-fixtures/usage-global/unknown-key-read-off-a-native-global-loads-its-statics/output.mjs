import "core-js/modules/es.object.assign";
import "core-js/modules/es.object.entries";
import "core-js/modules/es.object.freeze";
import "core-js/modules/es.object.from-entries";
import "core-js/modules/es.object.get-own-property-descriptor";
import "core-js/modules/es.object.get-own-property-descriptors";
import "core-js/modules/es.object.get-own-property-names";
import "core-js/modules/es.object.get-own-property-symbols";
import "core-js/modules/es.object.get-prototype-of";
import "core-js/modules/es.object.group-by";
import "core-js/modules/es.object.has-own";
import "core-js/modules/es.object.is";
import "core-js/modules/es.object.is-extensible";
import "core-js/modules/es.object.is-frozen";
import "core-js/modules/es.object.is-sealed";
import "core-js/modules/es.object.keys";
import "core-js/modules/es.object.prevent-extensions";
import "core-js/modules/es.object.seal";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.object.values";
import "core-js/modules/es.promise.constructor";
import "core-js/modules/es.promise.catch";
import "core-js/modules/es.promise.finally";
import "core-js/modules/es.promise.resolve";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.array.from-async";
import "core-js/modules/es.math.log2";
import "core-js/modules/es.array.from";
import "core-js/modules/es.array.of";
import "core-js/modules/es.global-this";
import "core-js/modules/es.json.is-raw-json";
import "core-js/modules/es.json.parse";
import "core-js/modules/es.json.raw-json";
import "core-js/modules/es.json.stringify";
import "core-js/modules/es.math.acosh";
import "core-js/modules/es.math.asinh";
import "core-js/modules/es.math.atanh";
import "core-js/modules/es.math.cbrt";
import "core-js/modules/es.math.clz32";
import "core-js/modules/es.math.cosh";
import "core-js/modules/es.math.expm1";
import "core-js/modules/es.math.fround";
import "core-js/modules/es.math.f16round";
import "core-js/modules/es.math.hypot";
import "core-js/modules/es.math.imul";
import "core-js/modules/es.math.log10";
import "core-js/modules/es.math.log1p";
import "core-js/modules/es.math.sign";
import "core-js/modules/es.math.sinh";
import "core-js/modules/es.math.sum-precise";
import "core-js/modules/es.math.tanh";
import "core-js/modules/es.math.trunc";
import "core-js/modules/es.string.from-code-point";
import "core-js/modules/es.string.iterator";
import "core-js/modules/es.string.raw";
import "core-js/modules/web.dom-collections.iterator";
// An unnamed static read may select any own static of its native global.
// Global usage loads those statics and their dependencies; prototype methods need separate usage.
// Member, destructured, inherited and parameter reads retain the same static obligation.
export const viaRealm = globalThis.String[key];
let assigned;
({
  [key]: assigned
} = Array);
const {
  JSON: {
    [key]: nested
  }
} = globalThis;
function pick({
  [key]: got
}) {
  return got;
}
export const viaParameter = pick(Math);
export function viaDefault(name, Kind = Object) {
  return Kind[name];
}
export { assigned, nested };