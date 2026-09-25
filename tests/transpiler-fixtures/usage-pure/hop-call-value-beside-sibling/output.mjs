import _pushMaybeArray from "@core-js/pure/actual/array/instance/push";
import _globalThis from "@core-js/pure/actual/global-this";
import _keys from "@core-js/pure/actual/instance/keys";
import _Object$keys from "@core-js/pure/actual/object/keys";
// A static reached through a call keeps that call and neighboring effects in source order.
// Known constructor arms receive pure values; user branches keep their own members.
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
  }) ?? Object,
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
  }) ?? Array,
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
  }) || userObj,
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
const _ref2 = {
    w: c ? eff() : userObj,
    q: 1
  },
  {
    w: _ref
  } = _ref2,
  viaTernaryUser = _ref === Object ? _Object$keys : _keys(_ref),
  {
    q: q8
  } = _ref2;
const _ref4 = {
    w: userObj || eff(),
    q: 1
  },
  {
    w: _ref3
  } = _ref4,
  viaUserLeft = _ref3 === Object ? _Object$keys : _ref3.keys,
  {
    q: q9
  } = _ref4;
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
  }) ?? Object
};
const {
  a: {
    of: viaProbe
  }
} = {
  a: _globalThis.window?.Array
};
export { viaCall, q1, viaTwoLeaves, viaTwoLeavesStatic, q2, viaNullish, q3, viaNullishOther, q4, viaOr, q5, viaTernary, q7, viaTernaryUser, q8, viaUserLeft, q9, viaSequence, q10, viaSole, viaProbe };