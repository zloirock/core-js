import _Array$of from "@core-js/pure/actual/array/of";
import _globalThis from "@core-js/pure/actual/global-this";
import _Iterator$from from "@core-js/pure/actual/iterator/from";
import _Map$groupBy from "@core-js/pure/actual/map/group-by";
import _Promise$try from "@core-js/pure/actual/promise/try";
import _Symbol from "@core-js/pure/actual/symbol/constructor";
import _Symbol$for from "@core-js/pure/actual/symbol/for";
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
    a: {
      groupBy: _Map$groupBy,
      prototype: _globalThis.Map.prototype
    }
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
      a: {
        try: _Promise$try,
        prototype: _globalThis.Promise.prototype
      }
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
      b: {
        from: _Iterator$from,
        prototype: _globalThis.Iterator.prototype
      }
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
  a: {
    of: _Array$of,
    prototype: _globalThis.Array.prototype
  }
});
export function viaServed(Symbol) {
  const {
    a: {
      for: forKey,
      prototype: symbols
    }
  } = {
    a: {
      for: _Symbol$for,
      prototype: _Symbol.prototype
    }
  };
  return [forKey, symbols];
}
export { of, prototype, Array };