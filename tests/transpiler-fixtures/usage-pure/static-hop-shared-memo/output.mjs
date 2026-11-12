import _Array$of from "@core-js/pure/actual/array/of";
import _nameMaybeFunction from "@core-js/pure/actual/function/instance/name";
// Static function properties share the same method value with their native sibling reads.
// Supported name dispatch keeps the source receiver across defaults and binding hosts.
const c = 1;
function eff() {}
const {
  of: {
    name: viaFlat,
    foo: f1
  }
} = {
  of: {
    name: _nameMaybeFunction(_Array$of),
    foo: _Array$of.foo
  }
};
const {
  of: {
    name: viaDefault,
    foo: f2
  } = {}
} = {
  of: {
    name: _nameMaybeFunction(_Array$of),
    foo: _Array$of.foo
  }
};
const viaWrapped = _nameMaybeFunction(_Array$of);
const [{
  foo: f3
}] = [_Array$of];
const [,] = [Array];
const {
  of: {
    name: viaWrappedDefault,
    foo: f4
  } = {}
} = {
  of: {
    name: _nameMaybeFunction(_Array$of),
    foo: _Array$of.foo
  }
};
const viaWrappedSibling = _nameMaybeFunction(_Array$of);
const [{
  foo: f5
}, z1] = [_Array$of, 1];
const [_ref,,] = [eff(), Array];
const z2 = _ref;
const viaWrappedBehindEffect = _nameMaybeFunction(_Array$of);
const {
  foo: f6
} = _Array$of;
for (const {
  of: {
    name: viaForInit,
    foo: f7
  }
} = {
  of: {
    name: _nameMaybeFunction(_Array$of),
    foo: _Array$of.foo
  }
};;) {
  [viaForInit, f7];
  break;
}
if (c) var {
  of: {
    name: viaBodyless,
    foo: f8
  }
} = {
  of: {
    name: _nameMaybeFunction(_Array$of),
    foo: _Array$of.foo
  }
};
const {
    of: {
      name: viaLeadingDeclarator,
      foo: f9
    }
  } = {
    of: {
      name: _nameMaybeFunction(_Array$of),
      foo: _Array$of.foo
    }
  },
  z3 = 1;
const z4 = 1,
  {
    of: {
      name: viaTrailingDeclarator,
      foo: f10
    } = {}
  } = {
    of: {
      name: _nameMaybeFunction(_Array$of),
      foo: _Array$of.foo
    }
  };
const {
  Array: {
    of: {
      name: viaHop,
      foo: f11
    } = {}
  }
} = {
  Array: {
    of: {
      name: _nameMaybeFunction(_Array$of),
      foo: _Array$of.foo
    }
  }
};
const {
  of: {
    name: viaRest,
    ...r1
  }
} = {
  of: _Array$of
};
const {
  of: {
    name: viaLength,
    length: l1
  } = {}
} = {
  of: {
    name: _nameMaybeFunction(_Array$of),
    length: _Array$of.length
  }
};
const {
  of: {
    name: viaSole
  }
} = {
  of: {
    name: _nameMaybeFunction(_Array$of)
  }
};
export { viaFlat, f1, viaDefault, f2, viaWrapped, f3, viaWrappedDefault, f4, viaWrappedSibling, f5, z1, z2, viaWrappedBehindEffect, f6, viaBodyless, f8, viaLeadingDeclarator, f9, z3, z4, viaTrailingDeclarator, f10, viaHop, f11, viaRest, r1, viaLength, l1, viaSole };