import _Array$from from "@core-js/pure/actual/array/from";
import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _globalThis from "@core-js/pure/actual/global-this";
// A relocated assignment head mirrors the realm hop before dispatching
// its nested prototype leaf, without changing the receiver used by the body.
let at, from;
for ({
  globalThis: {
    Array: {
      prototype: {
        at
      },
      from
    }
  }
} of [{
  globalThis: {
    Array: {
      prototype: {
        at: _atMaybeArray(_globalThis.Array.prototype)
      },
      from: _Array$from
    }
  }
}]) use(at, from);