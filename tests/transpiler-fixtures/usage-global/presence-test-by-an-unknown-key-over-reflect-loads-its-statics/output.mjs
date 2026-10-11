import "core-js/modules/es.object.to-string";
import "core-js/modules/es.reflect.namespace";
import "core-js/modules/es.reflect.apply";
import "core-js/modules/es.reflect.construct";
import "core-js/modules/es.reflect.define-property";
import "core-js/modules/es.reflect.delete-property";
import "core-js/modules/es.reflect.get";
import "core-js/modules/es.reflect.get-own-property-descriptor";
import "core-js/modules/es.reflect.get-prototype-of";
import "core-js/modules/es.reflect.has";
import "core-js/modules/es.reflect.is-extensible";
import "core-js/modules/es.reflect.own-keys";
import "core-js/modules/es.reflect.prevent-extensions";
import "core-js/modules/es.reflect.set";
import "core-js/modules/es.reflect.set-prototype-of";
import "core-js/modules/es.reflect.to-string-tag";
import "core-js/modules/es.global-this";
// a presence test by a key no fold names - a parameter's - may ask after any static of `Reflect`, so the
// namespace it tests carries every one, bare or off the realm; a namespace with no entry of its own
// (`Math`) has none to load
function supports(name) {
  return name in Reflect;
}
function realmSupports(name) {
  return name in globalThis.Reflect;
}
function mathSupports(name) {
  return name in Math;
}
export const ownKeys = supports('ownKeys');
export const apply = realmSupports('apply');
export const max = mathSupports('max');