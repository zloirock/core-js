import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.array.entries";
import "core-js/modules/es.array.from";
import "core-js/modules/es.array.keys";
import "core-js/modules/es.global-this";
import "core-js/modules/es.map.constructor";
import "core-js/modules/es.map.species";
import "core-js/modules/es.map.group-by";
import "core-js/modules/es.map.get-or-insert";
import "core-js/modules/es.map.get-or-insert-computed";
import "core-js/modules/es.string.iterator";
import "core-js/modules/es.typed-array.from";
import "core-js/modules/es.typed-array.of";
import "core-js/modules/es.typed-array.iterator";
import "core-js/modules/es.typed-array.at";
import "core-js/modules/es.typed-array.copy-within";
import "core-js/modules/es.typed-array.entries";
import "core-js/modules/es.typed-array.every";
import "core-js/modules/es.typed-array.fill";
import "core-js/modules/es.typed-array.filter";
import "core-js/modules/es.typed-array.find";
import "core-js/modules/es.typed-array.find-index";
import "core-js/modules/es.typed-array.find-last";
import "core-js/modules/es.typed-array.find-last-index";
import "core-js/modules/es.typed-array.for-each";
import "core-js/modules/es.typed-array.includes";
import "core-js/modules/es.typed-array.index-of";
import "core-js/modules/es.typed-array.join";
import "core-js/modules/es.typed-array.keys";
import "core-js/modules/es.typed-array.last-index-of";
import "core-js/modules/es.typed-array.map";
import "core-js/modules/es.typed-array.reduce";
import "core-js/modules/es.typed-array.reduce-right";
import "core-js/modules/es.typed-array.reverse";
import "core-js/modules/es.typed-array.set";
import "core-js/modules/es.typed-array.slice";
import "core-js/modules/es.typed-array.some";
import "core-js/modules/es.typed-array.sort";
import "core-js/modules/es.typed-array.species";
import "core-js/modules/es.typed-array.subarray";
import "core-js/modules/es.typed-array.to-locale-string";
import "core-js/modules/es.typed-array.to-reversed";
import "core-js/modules/es.typed-array.to-sorted";
import "core-js/modules/es.typed-array.to-string";
import "core-js/modules/es.typed-array.to-string-tag";
import "core-js/modules/es.typed-array.values";
import "core-js/modules/es.typed-array.with";
import "core-js/modules/es.uint8-array.from-base64";
import "core-js/modules/es.uint8-array.from-hex";
import "core-js/modules/es.uint8-array.set-from-base64";
import "core-js/modules/es.uint8-array.set-from-hex";
import "core-js/modules/es.uint8-array.to-base64";
import "core-js/modules/es.uint8-array.to-hex";
import "core-js/modules/web.dom-collections.iterator";
// A realm key whose slot the build leaves to the engine, its level defaulted, beside a sibling the build
// claims: an engine lacking the global runs the default, so its static keeps its module (`Array.from`)
const {
  Float16Array: {
    from
  } = Array,
  Map: M
} = globalThis;
export { from, M };