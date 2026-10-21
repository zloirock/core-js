import _Array$from from "@core-js/pure/actual/array/from";
import _globalThis from "@core-js/pure/actual/global-this";
import _Object$keys from "@core-js/pure/actual/object/keys";
// Shared capture and receiver-default routes preserve independently supported claims.
// Supplied values and defaults keep their source branches and independent claims.
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
} = null == _globalThis.window ? plain : {
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
} = {
  Array: {
    from: _Array$from
  }
};
export { reads, hostKeys, hostFrom, plainKeys, plainFrom, gatedFrom };