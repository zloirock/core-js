import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _valuesMaybeArray from "@core-js/pure/actual/array/instance/values";
import _globalThis from "@core-js/pure/actual/global-this";
import _Object$keys from "@core-js/pure/actual/object/keys";
// A loop initializer evaluates its effect before the first extracted binding.
// Static and instance reads retain their source property order.
let out1;
let out2;
for (const {
  Array: {
    prototype: {
      values: headValues,
      at: headAt
    }
  },
  Object: {
    keys: headKeys
  }
} = (_globalThis.effect ??= 1, {
  Array: {
    prototype: {
      values: _valuesMaybeArray(_globalThis.Array.prototype),
      at: _atMaybeArray(_globalThis.Array.prototype)
    }
  },
  Object: {
    keys: _Object$keys
  }
}); !out1;) out1 = [headValues, headAt, headKeys];
for (const {
  Object: {
    keys: tailKeys
  },
  Array: {
    prototype: {
      at: tailAt
    }
  }
} = (_globalThis.effect ??= 2, {
  Object: {
    keys: _Object$keys
  },
  Array: {
    prototype: {
      at: _atMaybeArray(_globalThis.Array.prototype)
    }
  }
}); !out2;) out2 = [tailKeys, tailAt];
export const r = [typeof out1[0], typeof out1[1], typeof out1[2], typeof out2[0], typeof out2[1]];