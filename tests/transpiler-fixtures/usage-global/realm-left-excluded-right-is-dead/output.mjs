import "core-js/modules/es.object.to-string";
import "core-js/modules/es.promise.constructor";
import "core-js/modules/es.promise.catch";
import "core-js/modules/es.promise.finally";
import "core-js/modules/es.promise.resolve";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.array.from-async";
import "core-js/modules/es.global-this";
import "core-js/modules/es.iterator.chunks";
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
// A realm read of a global the build is told not to inject still decides: the data subset carries `Iterator`,
// so the right never runs and its static loads nothing (no `Array.from` module), as over a bare name an engine
// lacking it throws on before the right could run (no `Array.of` module). A realm read of one the subset lacks
// at the mode decides nothing: the right's static keeps its module (`Array.fromAsync`).
const list = [1, 2];
export const viaRealm = (globalThis.Iterator || Array).from(list);
export const viaBare = (Iterator || Array).of(list);
export const viaUncarried = (globalThis.AsyncIterator || Array).fromAsync(list);