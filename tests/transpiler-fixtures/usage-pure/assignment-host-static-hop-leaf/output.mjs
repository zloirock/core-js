import _Array$of from "@core-js/pure/actual/array/of";
import _nameMaybeFunction from "@core-js/pure/actual/function/instance/name";
import _globalThis from "@core-js/pure/actual/global-this";
import _Map$groupBy from "@core-js/pure/actual/map/group-by";
// A nested assignment reads an instance member of a static (`name` of `Array.of`) through the static's
// ponyfill in every host an assignment takes: beside a sibling, inside a sequence or an unbraced `if`,
// under an array wrapper and over a leaf default. A constructor with a narrow entry (`Map`) has its
// static read off the static's own entry, which its narrow entry does not carry.
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
[{
  Array: {
    of: {
      name
    }
  }
}] = [{
  Array: {
    of: {
      name: _nameMaybeFunction(_Array$of)
    }
  }
}];
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