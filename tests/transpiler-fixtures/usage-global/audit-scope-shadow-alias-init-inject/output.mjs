import "core-js/modules/es.object.has-own";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.promise.constructor";
import "core-js/modules/es.promise.catch";
import "core-js/modules/es.promise.finally";
import "core-js/modules/es.promise.resolve";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.array.from-async";
import "core-js/modules/es.global-this";
import "core-js/modules/es.map.constructor";
import "core-js/modules/es.map.species";
import "core-js/modules/es.map.group-by";
import "core-js/modules/es.map.get-or-insert";
import "core-js/modules/es.map.get-or-insert-computed";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
// an alias whose init reads a proxy-global off a receiver must resolve that receiver in the alias's
// OWN declaration scope, not the use site. an inner param that reuses the receiver name (a minifier
// staple) shadows it at the use site only - resolving there drops the injection, a missing polyfill
// on a target that needs it. every init shape (member, zero-arg IIFE, destructure-alias) is affected
var globalRef = globalThis;
function readMember(globalRef) {
  return memberAlias.groupBy([], x => x);
}
var memberAlias = globalRef.Map;
function readIife(globalRef) {
  return iifeAlias.fromAsync([]);
}
var iifeAlias = (() => globalRef.Array)();
function readDestructure(globalRef) {
  return destructureAlias.hasOwn({}, 'x');
}
var {
  Object: destructureAlias
} = globalRef;