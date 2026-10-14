import _Array$from from "@core-js/pure/actual/array/from";
import _Array$fromAsync from "@core-js/pure/actual/array/from-async";
import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _Array$of from "@core-js/pure/actual/array/of";
import _nameMaybeFunction from "@core-js/pure/actual/function/instance/name";
import _getIteratorMethod from "@core-js/pure/actual/get-iterator-method";
import _globalThis from "@core-js/pure/actual/global-this";
import _Map$groupBy from "@core-js/pure/actual/map/group-by";
import _Object$keys from "@core-js/pure/actual/object/keys";
import _Promise$any from "@core-js/pure/actual/promise/any";
import _Symbol$for from "@core-js/pure/actual/symbol/for";
import _Symbol$iterator from "@core-js/pure/actual/symbol/iterator";
// A parameter default selecting the realm mirrors the realm arm level by level: a defaulted instance leaf
// off the prototype hop, an instance leaf beside a static, a `Symbol.iterator` slot, a descended prototype
// hop and a proxy hop over two constructors each take their slot in the arm the realm stands in.
const user = {};
export function a({
  Array: {
    prototype: {
      at: x = 1
    },
    from: y
  }
} = c ? {
  Array: {
    prototype: {
      at: _atMaybeArray(_globalThis.Array.prototype)
    },
    from: _Array$from
  }
} : user) {
  return [x, y];
}
export function b({
  Array: {
    of: x,
    name: y
  }
} = c ? {
  Array: {
    of: _Array$of,
    name: _nameMaybeFunction(_globalThis.Array)
  }
} : user) {
  return [x, y];
}
export function d({
  Object: {
    keys: x,
    [_Symbol$iterator]: y
  }
} = c ? {
  Object: {
    keys: _Object$keys,
    [_Symbol$iterator]: _getIteratorMethod(_globalThis.Object)
  }
} : user) {
  return [x, y];
}
export function e({
  Array: {
    prototype: {
      flat: x
    },
    isArray: y
  }
} = c ? _globalThis : user) {
  return [x, y];
}
export function g({
  self: {
    Map: {
      groupBy: x
    },
    Symbol: {
      for: y
    }
  }
} = c ? {
  self: {
    Map: {
      groupBy: _Map$groupBy
    },
    Symbol: {
      for: _Symbol$for
    }
  }
} : user) {
  return [x, y];
}
export function h({
  self: {
    Array: {
      fromAsync: x
    },
    Promise: {
      any: y
    }
  }
} = c ? {
  self: {
    Array: {
      fromAsync: _Array$fromAsync
    },
    Promise: {
      any: _Promise$any
    }
  }
} : fb) {
  return [x, y];
}