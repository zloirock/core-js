import "core-js/modules/es.object.to-string";
import "core-js/modules/es.aggregate-error.constructor";
import "core-js/modules/es.aggregate-error.cause";
import "core-js/modules/es.promise.constructor";
import "core-js/modules/es.promise.catch";
import "core-js/modules/es.promise.finally";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.global-this";
import "core-js/modules/es.iterator.constructor";
import "core-js/modules/es.iterator.dispose";
import "core-js/modules/es.iterator.drop";
import "core-js/modules/es.iterator.every";
import "core-js/modules/es.iterator.filter";
import "core-js/modules/es.iterator.find";
import "core-js/modules/es.iterator.flat-map";
import "core-js/modules/es.iterator.for-each";
import "core-js/modules/es.iterator.map";
import "core-js/modules/es.iterator.reduce";
import "core-js/modules/es.iterator.some";
import "core-js/modules/es.iterator.take";
import "core-js/modules/es.iterator.to-array";
import "core-js/modules/esnext.iterator.chunks";
import "core-js/modules/esnext.iterator.includes";
import "core-js/modules/esnext.iterator.join";
import "core-js/modules/esnext.iterator.windows";
import "core-js/modules/web.dom-collections.iterator";
// usage-global is injection-only on the self-ref var shape (the binding is never
// rewritten), so a CONDITIONAL reassignment does not suppress the injection - the
// cond-false path still reads the pristine global
var Iterator = Iterator;
if (globalThis.cond) Iterator = mock;
export { Iterator };

// negative: an unconditional reassignment DOMINATES the later member use - `es.promise.try`
// stays out (the never-dominated init self-read keeps the constructor set alone)
var Promise = Promise;
Promise = mock2;
export const t = Promise.try;

// hoisting edge: a write TEXTUALLY before the hoisted declarator - injection stays
// (over-inject-safe; at runtime the hoisted local absorbs the early write)
AggregateError = hoistMock;
var AggregateError = AggregateError;
export const ae = AggregateError;