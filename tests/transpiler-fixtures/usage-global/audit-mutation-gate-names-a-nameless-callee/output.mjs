import "core-js/modules/es.object.entries";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.reflect.namespace";
import "core-js/modules/es.reflect.own-keys";
import "core-js/modules/es.array.map";
import "core-js/modules/es.array.species";
import "core-js/modules/es.iterator.constructor";
import "core-js/modules/es.iterator.for-each";
import "core-js/modules/es.iterator.map";
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