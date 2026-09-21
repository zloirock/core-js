import "core-js/modules/es.symbol.constructor";
import "core-js/modules/es.symbol.description";
import "core-js/modules/es.symbol.iterator";
import "core-js/modules/es.object.assign";
import "core-js/modules/es.object.get-own-property-symbols";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.array.from";
import "core-js/modules/es.array.push";
import "core-js/modules/es.global-this";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
// A nested static rest keeps its source and excludes the claimed key.
// Extra array elements run before the binding; the assignment yields the original array.
const events = [];
let held, from, rest;
const result = [{
  Array: {
    from,
    ...rest
  }
}] = [held = (events.push('source'), globalThis), events.push(typeof from)];
export { events, held, from, rest, result };