import _Array$from from "@core-js/pure/actual/array/from";
import _Object$keys from "@core-js/pure/actual/object/keys";
// A user object the receiver walk resolves through its own keys is a mirror root exactly as a
// pristine proxy global is: the effect-keyed pattern renders ONCE, off both ponyfills, on both legs.
// Each negative declines that literal and leaves every leaf to whatever route serves it alone - a
// slot behind a getter, a parameter root, a root rewritten before the read (where the literal would
// hand back the initializer's statics over the user's own), a key naming no constructor, and a
// CAPTURED assignment, whose value is the receiver a literal would replace.
let hits = 0;
const src = {
  Object,
  Array
};
let bind, from;
({
  Object: {
    keys: {
      [(hits++, 'bind')]: bind
    }
  },
  Array: {
    [(hits++, 'from')]: from
  }
} = {
  Object: {
    keys: _Object$keys
  },
  Array: {
    from: _Array$from
  }
});
export const mirrored = [typeof bind, typeof from, hits];
const getterRoot = {
  Object,
  get Array() {
    hits++;
    return Array;
  }
};
let getterBind, getterFrom;
({
  Object: {
    keys: {
      [(hits++, 'bind')]: getterBind
    }
  },
  Array: {
    [(hits++, 'from')]: getterFrom
  }
} = getterRoot);
export const behindGetter = [typeof getterBind, typeof getterFrom];
export function fromParameter(root) {
  let paramBind, paramFrom;
  ({
    Object: {
      keys: {
        [(hits++, 'bind')]: paramBind
      }
    },
    Array: {
      [(hits++, 'from')]: paramFrom
    }
  } = root);
  return [typeof paramBind, typeof paramFrom];
}
let moved = {
  Object,
  Array
};
moved = {
  Object: {
    keys: () => 'user'
  },
  Array: {
    from: () => 'user'
  }
};
let movedBind, movedFrom;
({
  Object: {
    keys: {
      [(hits++, 'bind')]: movedBind
    }
  },
  Array: {
    [(hits++, 'from')]: movedFrom
  }
} = moved);
export const rewritten = [typeof movedBind, movedFrom()];
const aliased = {
  O: Object,
  A: Array
};
let aliasBind, aliasFrom;
({
  O: {
    keys: {
      bind: aliasBind
    }
  },
  A: {
    from: aliasFrom
  }
} = {
  O: {
    keys: _Object$keys
  },
  A: {
    from: _Array$from
  }
});
export const unnamed = [typeof aliasBind, typeof aliasFrom];
let capturedBind, capturedFrom;
const captured = {
  Object: {
    keys: {
      [(hits++, 'bind')]: capturedBind
    }
  },
  Array: {
    [(hits++, 'from')]: capturedFrom = _Array$from
  }
} = src;
export const yielded = [captured === src, typeof capturedBind, typeof capturedFrom];