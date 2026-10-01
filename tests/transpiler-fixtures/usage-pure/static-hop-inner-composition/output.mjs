import _Array$of from "@core-js/pure/actual/array/of";
import _nameMaybeFunction from "@core-js/pure/actual/function/instance/name";
// An instance leaf under a static reads through that static's ponyfill.
// A dead pattern default must not hide the live leaf claim; siblings read the same pure value.
const {
  Array: {
    of: {
      name: viaHop
    } = {}
  } = {}
} = {
  Array: {
    of: {
      name: _nameMaybeFunction(_Array$of)
    }
  }
};
const {
  Array: {
    of: {
      name: viaNoOuterDefault
    } = {}
  }
} = {
  Array: {
    of: {
      name: _nameMaybeFunction(_Array$of)
    }
  }
};
const {
  Array: {
    of: {
      name: viaNoDefault
    }
  }
} = {
  Array: {
    of: {
      name: _nameMaybeFunction(_Array$of)
    }
  }
};
const {
  of: {
    name: viaMemberInit
  } = {}
} = {
  of: {
    name: _nameMaybeFunction(_Array$of)
  }
};
const {
  of: {
    name: viaMemberInitBare
  }
} = {
  of: {
    name: _nameMaybeFunction(_Array$of)
  }
};
let viaAssign;
({
  Array: {
    of: {
      name: viaAssign
    } = {}
  } = {}
} = {
  Array: {
    of: {
      name: _nameMaybeFunction(_Array$of)
    }
  }
});
const {
  of: {
    name: withSibling,
    foo
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
      name: hopWithSibling,
      length
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
export { viaHop, viaNoOuterDefault, viaNoDefault, viaMemberInit, viaMemberInitBare, viaAssign, withSibling, foo, hopWithSibling, length };