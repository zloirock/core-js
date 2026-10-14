import "core-js/modules/es.symbol.constructor";
import "core-js/modules/es.symbol.description";
import "core-js/modules/es.symbol.for";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.promise.catch";
import "core-js/modules/es.promise.finally";
import "core-js/modules/es.promise.try";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.array.of";
import "core-js/modules/es.global-this";
import "core-js/modules/es.iterator.chunks";
import "core-js/modules/es.iterator.dispose";
import "core-js/modules/es.iterator.drop";
import "core-js/modules/es.iterator.every";
import "core-js/modules/es.iterator.filter";
import "core-js/modules/es.iterator.find";
import "core-js/modules/es.iterator.flat-map";
import "core-js/modules/es.iterator.for-each";
import "core-js/modules/es.iterator.from";
import "core-js/modules/es.iterator.includes";
import "core-js/modules/es.iterator.join";
import "core-js/modules/es.iterator.map";
import "core-js/modules/es.iterator.reduce";
import "core-js/modules/es.iterator.some";
import "core-js/modules/es.iterator.take";
import "core-js/modules/es.iterator.to-array";
import "core-js/modules/es.iterator.windows";
import "core-js/modules/es.map.species";
import "core-js/modules/es.map.group-by";
import "core-js/modules/es.map.get-or-insert";
import "core-js/modules/es.map.get-or-insert-computed";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
import "core-js/modules/web.self";
// A mirror re-reads a receiver valued as a global by that global's name where its literal stands, and a
// binding of that name there - a parameter, a catch parameter, a local, an import - holds the user's own
// value: the read goes through the realm instead, from a nested container and in an assignment alike. A
// served constructor's read is its ponyfill, which no binding of the name shadows (`Symbol`).
import { Array } from './array.js';
export function viaParameter(Map) {
  const {
    a: {
      groupBy,
      prototype
    }
  } = {
    a: globalThis.Map
  };
  return [groupBy, prototype];
}
export function viaCatch() {
  try {
    run();
  } catch (Promise) {
    const {
      a: {
        try: attempt,
        prototype
      }
    } = {
      a: self.Promise
    };
    return [attempt, prototype];
  }
}
export function viaLocal() {
  const Iterator = null;
  const {
    a: {
      b: {
        from,
        prototype
      }
    }
  } = {
    a: {
      b: globalThis.Iterator
    }
  };
  return [from, prototype, Iterator];
}
let of, prototype;
({
  a: {
    of,
    prototype
  }
} = {
  a: globalThis.Array
});
export function viaServed(Symbol) {
  const {
    a: {
      for: forKey,
      prototype: symbols
    }
  } = {
    a: globalThis.Symbol
  };
  return [forKey, symbols];
}
export { of, prototype, Array };