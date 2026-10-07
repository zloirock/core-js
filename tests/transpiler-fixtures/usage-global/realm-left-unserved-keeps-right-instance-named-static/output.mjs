import "core-js/modules/es.symbol.constructor";
import "core-js/modules/es.symbol.description";
import "core-js/modules/es.symbol.for";
import "core-js/modules/es.symbol.match";
import "core-js/modules/es.symbol.match-all";
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
import "core-js/modules/web.self";
// A key naming both an instance method and a static of the right's constructor: a `||` / `??` left read
// off the realm of a global the build does not serve - directly, under another realm name, through an
// alias or a destructured binding - leaves the right live, and that arm takes the static's own entry,
// beside a sibling static too.
const {
  concat
} = globalThis.WeakRef || Iterator;
const {
  entries
} = globalThis.FinalizationRegistry ?? Object;
const {
  split
} = self.WeakRef || Symbol;
const Ref = globalThis.WeakRef;
const {
  values
} = Ref || Object;
const {
  FinalizationRegistry: Registry
} = globalThis;
const {
  match
} = Registry ?? Symbol;
const {
  matchAll,
  for: forKey
} = globalThis.WeakRef || Symbol;
export { concat, entries, split, values, match, matchAll, forKey };