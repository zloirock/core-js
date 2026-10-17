import "core-js/modules/es.symbol.constructor";
import "core-js/modules/es.symbol.description";
import "core-js/modules/es.symbol.match";
import "core-js/modules/es.symbol.replace";
import "core-js/modules/es.symbol.search";
import "core-js/modules/es.symbol.split";
import "core-js/modules/es.object.entries";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.object.values";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.global-this";
import "core-js/modules/es.iterator.constructor";
import "core-js/modules/es.iterator.chunks";
import "core-js/modules/es.iterator.concat";
import "core-js/modules/es.iterator.dispose";
import "core-js/modules/es.iterator.drop";
import "core-js/modules/es.iterator.every";
import "core-js/modules/es.iterator.filter";
import "core-js/modules/es.iterator.find";
import "core-js/modules/es.iterator.flat-map";
import "core-js/modules/es.iterator.for-each";
import "core-js/modules/es.iterator.includes";
import "core-js/modules/es.iterator.join";
import "core-js/modules/es.iterator.map";
import "core-js/modules/es.iterator.reduce";
import "core-js/modules/es.iterator.some";
import "core-js/modules/es.iterator.take";
import "core-js/modules/es.iterator.to-array";
import "core-js/modules/es.iterator.windows";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
// A `||` left read off the realm of a global the build does not serve leaves its right live on every
// destructuring host, and a key naming both an instance method and a static of the right's constructor
// takes the static's own entry on that arm: an assignment, a member target, a parameter default and its
// inner default, a call argument, an exported declaration and a leaf default.
let concat;
({
  concat
} = globalThis.WeakRef || Iterator);
const target = {};
({
  entries: target.entries
} = globalThis.WeakRef || Object);
export function pick({
  values
} = globalThis.WeakRef || Object) {
  return values;
}
export function inner({
  deep: {
    match
  } = globalThis.WeakRef || Symbol
} = {}) {
  return match;
}
(({
  replace
}) => use(replace))(globalThis.WeakRef || Symbol);
export const {
  split
} = globalThis.WeakRef || Symbol;
const {
  search = null
} = globalThis.WeakRef || Symbol;
export { concat, target, search };