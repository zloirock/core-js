import "core-js/modules/es.symbol.constructor";
import "core-js/modules/es.symbol.description";
import "core-js/modules/es.symbol.iterator";
import "core-js/modules/es.object.assign";
import "core-js/modules/es.object.entries";
import "core-js/modules/es.object.get-own-property-symbols";
import "core-js/modules/es.object.has-own";
import "core-js/modules/es.object.keys";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.array.from";
import "core-js/modules/es.array.push";
import "core-js/modules/es.global-this";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
// Nested statics keep their source hops and object-rest exclusions.
// The initializer prefix runs once before the extracted bindings.
const log = [];
const [{
  Object: {
    keys,
    ...rest
  }
}] = [(log.push('init'), globalThis)];
const [{
  Object: {
    entries = log.push('default'),
    ...remaining
  }
}, tail] = [globalThis, 1];
export const r = [keys({
  a: tail
}), entries({
  b: 2
}), log, Object.hasOwn(rest, 'keys'), Object.hasOwn(remaining, 'entries')];