import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.array.of";
import "core-js/modules/es.global-this";
import "core-js/modules/es.map.constructor";
import "core-js/modules/es.map.species";
import "core-js/modules/es.map.group-by";
import "core-js/modules/es.map.get-or-insert";
import "core-js/modules/es.map.get-or-insert-computed";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
// A chain rooted at a SELECTION names its candidates by the arms: an arm that resolves to a
// pristine proxy global - spelled, or reached through a call the census resolves - is a realm the
// captured receiver is tested against; an opaque arm falls through to the raw read the guard keeps.
function realm() {
  return globalThis;
}
function opaque() {
  return {
    Array: {
      of() {
        return 'custom';
      }
    }
  };
}
export function direct(flag) {
  return (flag ? realm() : opaque()).Array.of(1);
}
export function aliased(flag) {
  const held = (flag ? realm() : opaque()).Array;
  return held.of(1);
}
export function spelled(flag) {
  return (flag ? globalThis : opaque()).Array.of(1);
}
// A constructor with a pure entry keeps its statics: the read off the selection is a held slot.
export function ctorStatic(flag) {
  return (flag ? realm() : opaque()).Map.groupBy([1, 2], value => value % 2);
}
// No arm names a realm: nothing to test against, the read stays native.
export function opaqueOnly(flag) {
  return (flag ? opaque() : {
    Array
  }).Array.of(1);
}