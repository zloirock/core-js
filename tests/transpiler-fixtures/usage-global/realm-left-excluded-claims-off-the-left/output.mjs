import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.array.of";
import "core-js/modules/es.global-this";
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
// A `||` / `??` left naming a built-in the build is told not to inject still counts as one: the data subset
// carries `Iterator`, so the right never runs and its static loads nothing (`Array.from`), each key claiming
// off the left - an excluded static loads nothing (`Iterator.from`), a kept one its module (`Iterator.concat`).
// A left the subset lacks at the mode (`AsyncIterator`) hands the claim to the right (`Array.of`).
const {
  from
} = globalThis.Iterator || Array;
const {
  concat
} = globalThis.Iterator ?? Array;
const {
  of
} = globalThis.AsyncIterator || Array;
export { from, concat, of };