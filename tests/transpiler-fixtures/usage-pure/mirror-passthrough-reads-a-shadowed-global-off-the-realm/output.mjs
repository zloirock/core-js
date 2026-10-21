import _globalThis from "@core-js/pure/actual/global-this";
import _self from "@core-js/pure/actual/self";
import _Symbol from "@core-js/pure/actual/symbol";
// Literal-container static/global leaves use the shared fallback; no wrapper synthesis is required.
// Binding identity, writes and later reads retain their existing inference and ordering.
import { Array } from './array.js';
export function viaParameter(Map) {
  const {
    a: {
      groupBy,
      prototype
    }
  } = {
    a: _globalThis.Map
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
      a: _self.Promise
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
      b: _globalThis.Iterator
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
  a: _globalThis.Array
});
export function viaServed(Symbol) {
  const {
    a: {
      for: forKey,
      prototype: symbols
    }
  } = {
    a: _Symbol
  };
  return [forKey, symbols];
}
export { of, prototype, Array };