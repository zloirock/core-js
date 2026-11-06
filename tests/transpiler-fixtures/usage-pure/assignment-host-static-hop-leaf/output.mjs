import _Array$of from "@core-js/pure/actual/array/of";
import _nameMaybeFunction from "@core-js/pure/actual/function/instance/name";
import _globalThis from "@core-js/pure/actual/global-this";
import _Map$groupBy from "@core-js/pure/actual/map/group-by";
// Nested assignment leaves read function names from the served static methods.
// Their receiver, defaults and residual siblings stay ordered across statement and expression hosts.
let name, junk, arity;
({
  Array: {
    of: {
      name
    },
    junk
  }
} = {
  Array: {
    of: {
      name: _nameMaybeFunction(_Array$of)
    },
    junk: _globalThis.Array.junk
  }
});
({
  Array: {
    of: {
      name
    }
  }
} = {
  Array: {
    of: {
      name: _nameMaybeFunction(_Array$of)
    }
  }
});
arity = 1;
({
  Array: {
    of: {
      name
    }
  }
} = {
  Array: {
    of: {
      name: _nameMaybeFunction(_Array$of)
    }
  }
});
if (arity) ({
  Array: {
    of: {
      name
    }
  }
} = {
  Array: {
    of: {
      name: _nameMaybeFunction(_Array$of)
    }
  }
});
[,] = [_globalThis];
name = _nameMaybeFunction(_Array$of);
({
  Array: {
    of: {
      name = 'd'
    }
  }
} = {
  Array: {
    of: {
      name: _nameMaybeFunction(_Array$of)
    }
  }
});
({
  Map: {
    groupBy: {
      name
    }
  }
} = {
  Map: {
    groupBy: {
      name: _nameMaybeFunction(_Map$groupBy)
    }
  }
});
export { name, junk, arity };