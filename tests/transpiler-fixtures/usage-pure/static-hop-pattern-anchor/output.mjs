import _Array$from from "@core-js/pure/actual/array/from";
import _pushMaybeArray from "@core-js/pure/actual/array/instance/push";
import _Array$of from "@core-js/pure/actual/array/of";
import _nameMaybeFunction from "@core-js/pure/actual/function/instance/name";
import _globalThis from "@core-js/pure/actual/global-this";
import _Map$groupBy from "@core-js/pure/actual/map/group-by";
// A pattern under a static destructures its ponyfill on declaration and assignment hosts.
// Nested instance claims read that same pure value; defaults stay dead where it is defined.
// Array wrappers, aliases, proxy hops and calls preserve effects and source bindings.
const log = [];
function realm() {
  _pushMaybeArray(log).call(log, 'r');
  return _globalThis;
}
const {
  Array: {
    of: {
      length: declared
    }
  }
} = {
  Array: {
    of: _Array$of
  }
};
let assigned;
({
  Array: {
    of: {
      length: assigned
    }
  }
} = {
  Array: {
    of: _Array$of
  }
});
const {
  Array: {
    of: {
      name: declaredName,
      length: declaredTwo
    }
  }
} = {
  Array: {
    of: {
      name: _nameMaybeFunction(_Array$of),
      length: _Array$of.length
    }
  }
};
let assignedName, assignedTwo;
({
  Array: {
    of: {
      name: assignedName,
      length: assignedTwo
    }
  }
} = {
  Array: {
    of: {
      name: _nameMaybeFunction(_Array$of),
      length: _Array$of.length
    }
  }
});
const {
  Map: {
    groupBy: {
      length: grouped
    }
  }
} = {
  Map: {
    groupBy: _Map$groupBy
  }
};
const {
  Array: {
    of: {
      length: prefixed
    }
  }
} = (_pushMaybeArray(log).call(log, 'e'), {
  Array: {
    of: _Array$of
  }
});
const {
  Array: {
    of: {
      length: defaulted = 9
    }
  }
} = {
  Array: {
    of: _Array$of
  }
};
const {
  Array: {
    of: {
      ...rest
    }
  }
} = {
  Array: {
    of: _Array$of
  }
};
const {
  Array: {
    of: {
      length: beside
    },
    from
  }
} = {
  Array: {
    of: _Array$of,
    from: _Array$from
  }
};
const {
  Array: {
    of: {
      length: viaSelf
    }
  }
} = {
  Array: {
    of: _Array$of
  }
};
let called;
({
  Array: {
    of: {
      length: called
    }
  }
} = (realm(), {
  Array: {
    of: _Array$of
  }
}));
const {
  from: {
    length: ctorDeclared
  }
} = {
  from: _Array$from
};
let ctorAssigned;
({
  from: {
    length: ctorAssigned
  }
} = {
  from: _Array$from
});
const Aliased = Array;
const {
  from: {
    length: ctorAlias
  }
} = {
  from: _Array$from
};
const {
  from: {
    length: ctorMember
  }
} = {
  from: _Array$from
};
const {
  groupBy: {
    length: ctorEntry
  }
} = {
  groupBy: _Map$groupBy
};
export { declared, assigned, declaredName, declaredTwo, assignedName, assignedTwo, grouped, prefixed, defaulted, rest, beside, from, viaSelf, called, log };
export { ctorDeclared, ctorAssigned, ctorAlias, ctorMember, ctorEntry };