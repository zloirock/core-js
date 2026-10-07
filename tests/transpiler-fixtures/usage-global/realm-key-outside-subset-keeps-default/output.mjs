import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.array.from";
import "core-js/modules/es.array.of";
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
import "core-js/modules/es.json.parse";
import "core-js/modules/es.string.iterator";
// A realm key naming a built-in the configured subset does not carry (`AsyncIterator` and `URL` in `es`)
// is an unknown slot: an engine lacking it takes the inner default, whose static keeps its module
// (`Array.from`, `JSON.parse`). A built-in the subset carries takes its default as dead (`Iterator`); a known
// global core-js implements nothing of (`WeakRef`) may be missing on a target too (`Array.of`).
const {
  AsyncIterator: {
    from
  } = Array
} = globalThis;
const {
  URL: {
    parse
  } = JSON
} = globalThis;
const {
  Iterator: {
    concat
  } = Array
} = globalThis;
const {
  WeakRef: {
    of
  } = Array
} = globalThis;
export { from, parse, concat, of };