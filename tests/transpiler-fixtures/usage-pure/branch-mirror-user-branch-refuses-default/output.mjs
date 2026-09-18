import _Array$from from "@core-js/pure/actual/array/from";
import _globalThis from "@core-js/pure/actual/global-this";
import _Object$keys from "@core-js/pure/actual/object/keys";
// A selection with a USER value branch refuses the inline default exactly as it refuses the mirror:
// on that branch the slot's `undefined` is the object's own answer, and the ponyfill would bind
// core-js's implementation over the value that object decides. An EFFECTFUL accessor on a key the
// pattern reads cancels the mirror - a literal cannot run it - so the leaf keeps the default the
// source wrote. A branch set the walk proves realm-only mirrors, and its slot leaves that default dead.
let reads = 0;
const host = {
  Object,
  get Array() {
    reads += 1;
    return Array;
  }
};
const {
  Object: {
    keys: hostKeys
  },
  Array: {
    from: hostFrom = null
  }
} = null == _globalThis.window ? host : {
  Object: {
    keys: _Object$keys
  },
  Array: {
    from: _Array$from
  }
};
const plain = {
  Object,
  Array
};
const {
  Object: {
    keys: plainKeys
  },
  Array: {
    from: plainFrom = null
  }
} = null == _globalThis.window ? {
  Object: {
    keys: _Object$keys
  },
  Array: {
    from: _Array$from
  }
} : {
  Object: {
    keys: _Object$keys
  },
  Array: {
    from: _Array$from
  }
};
let gate = 1;
const {
  Array: {
    from: gatedFrom = null
  }
} = gate && {
  Array: {
    from: _Array$from
  }
};
export { reads, hostKeys, hostFrom, plainKeys, plainFrom, gatedFrom };