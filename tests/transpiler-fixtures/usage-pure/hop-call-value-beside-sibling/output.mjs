import _pushMaybeArray from "@core-js/pure/actual/array/instance/push";
import _globalThis from "@core-js/pure/actual/global-this";
import _Object$keys from "@core-js/pure/actual/object/keys";
// A static reached through a call keeps that call and neighboring effects in source order.
// Known constructor arms receive pure values; user branches keep their own members, and an arm the
// selection never reaches drops with it.
const c = 1;
const userObj = {};
const log = [];
function eff() {
  _pushMaybeArray(log).call(log, 1);
  return Object;
}
const {
  w: {
    keys: viaCall
  },
  q: q1
} = {
  w: (eff(), {
    keys: _Object$keys
  }),
  q: 1
};
const {
  w: {
    at: viaTwoLeaves,
    keys: viaTwoLeavesStatic
  },
  q: q2
} = {
  w: (eff(), {
    at: Object.at,
    keys: _Object$keys
  }),
  q: 1
};
const {
  w: {
    keys: viaNullish
  },
  q: q3
} = {
  w: (eff(), {
    keys: _Object$keys
  }),
  q: 1
};
const {
  w: {
    keys: viaNullishOther
  },
  q: q4
} = {
  w: (eff(), {
    keys: _Object$keys
  }),
  q: 1
};
const {
  w: {
    keys: viaOr
  },
  q: q5
} = {
  w: (eff(), {
    keys: _Object$keys
  }),
  q: 1
};
const {
  w: {
    keys: viaTernary
  },
  q: q7
} = {
  w: c ? (eff(), {
    keys: _Object$keys
  }) : {
    keys: _Object$keys
  },
  q: 1
};
const {
  w: {
    keys: viaTernaryUser
  },
  q: q8
} = {
  w: c ? (eff(), {
    keys: _Object$keys
  }) : userObj,
  q: 1
};
const _ref2 = {
    w: userObj || eff(),
    q: 1
  },
  {
    w: _ref
  } = _ref2,
  viaUserLeft = _ref === Object ? _Object$keys : _ref.keys,
  {
    q: q9
  } = _ref2;
const {
  w: {
    keys: viaSequence
  },
  q: q10
} = {
  w: (_pushMaybeArray(log).call(log, 2), eff(), {
    keys: _Object$keys
  }),
  q: 1
};
const {
  w: {
    keys: viaSole
  }
} = {
  w: (eff(), {
    keys: _Object$keys
  })
};
const {
  a: {
    of: viaProbe
  }
} = {
  a: _globalThis.window?.Array
};
export { viaCall, q1, viaTwoLeaves, viaTwoLeavesStatic, q2, viaNullish, q3, viaNullishOther, q4, viaOr, q5, viaTernary, q7, viaTernaryUser, q8, viaUserLeft, q9, viaSequence, q10, viaSole, viaProbe };