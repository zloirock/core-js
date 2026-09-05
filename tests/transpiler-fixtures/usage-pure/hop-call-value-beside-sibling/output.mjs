import _pushMaybeArray from "@core-js/pure/actual/array/instance/push";
import _globalThis from "@core-js/pure/actual/global-this";
import _Object$keys from "@core-js/pure/actual/object/keys";
// a hop whose VALUE the walk cannot name but the name channel can - a call's return type, or a
// selection the other leg reads by its selecting arm - beside a sibling the pattern keeps: the leaf
// extracts off the constructor and the residual keeps the whole value, so the call runs where it ran.
// a `||` / `??` LEFT naming an object selects, a ternary needs agreeing arms (disagreeing arms
// mirror per branch); `&&` may yield its falsy left and stays whole, and so does a member nav under
// a probe
const c = 1;
const userObj = {};
const log = [];
function eff() {
  _pushMaybeArray(log).call(log, 1);
  return Object;
}
const viaCall = _Object$keys;
const {
  q: q1
} = {
  w: eff(),
  q: 1
};
const viaTwoLeavesStatic = _Object$keys;
const {
  w: {
    at: viaTwoLeaves
  },
  q: q2
} = {
  w: eff(),
  q: 1
};
const viaNullish = _Object$keys;
const {
  q: q3
} = {
  w: eff() ?? Object,
  q: 1
};
const viaNullishOther = _Object$keys;
const {
  q: q4
} = {
  w: eff() ?? Array,
  q: 1
};
const viaOr = _Object$keys;
const {
  q: q5
} = {
  w: eff() || userObj,
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
const {
  w: {
    keys: viaUserLeft
  },
  q: q9
} = {
  w: userObj || (eff(), {
    keys: _Object$keys
  }),
  q: 1
};
const viaSequence = _Object$keys;
const {
  q: q10
} = {
  w: (_pushMaybeArray(log).call(log, 2), eff()),
  q: 1
};
const viaSole = (eff() ?? Object, _Object$keys);
const {
  a: {
    of: viaProbe
  }
} = {
  a: _globalThis.window?.Array
};
export { viaCall, q1, viaTwoLeaves, viaTwoLeavesStatic, q2, viaNullish, q3, viaNullishOther, q4, viaOr, q5, viaTernary, q7, viaTernaryUser, q8, viaUserLeft, q9, viaSequence, q10, viaSole, viaProbe };