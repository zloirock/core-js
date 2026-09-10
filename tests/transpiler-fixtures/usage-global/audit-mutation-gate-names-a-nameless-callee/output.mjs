import "core-js/modules/es.object.assign";
import "core-js/modules/es.object.define-getter";
import "core-js/modules/es.object.define-setter";
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
import "core-js/modules/es.object.lookup-getter";
import "core-js/modules/es.object.lookup-setter";
import "core-js/modules/es.object.prevent-extensions";
import "core-js/modules/es.object.seal";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.object.values";
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
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.array.map";
import "core-js/modules/es.array.species";
import "core-js/modules/es.iterator.constructor";
import "core-js/modules/es.iterator.for-each";
import "core-js/modules/es.iterator.map";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
import "core-js/modules/web.dom-collections.for-each";
// two call hosts spell no callee name at all: an immediately-invoked literal IS the function, and a
// tag hands its strings array the first slot and the interpolation the second. the pairing has to
// reach the parameter through both, or the write never names what it patches. the gate is coarse
// per receiver, so the two rows take different ones - on one receiver either write would answer for
// both, and the row that stopped working would stay green
const o = {};
(function (ns) {
  ns.entries = patch;
})(Object);
Object.entries(o).forEach(noop);
function tag(strings, ns) {
  ns.ownKeys = patch;
}
tag`${Reflect}`;
Reflect.ownKeys(o).map(noop);