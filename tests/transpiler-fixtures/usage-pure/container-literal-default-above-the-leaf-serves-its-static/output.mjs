import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _nameMaybeFunction from "@core-js/pure/actual/function/instance/name";
import _Iterator from "@core-js/pure/actual/iterator";
import _Map from "@core-js/pure/actual/map";
import _Promise from "@core-js/pure/actual/promise";
import _Promise$withResolvers from "@core-js/pure/actual/promise/with-resolvers";
// Literal-container static/global leaves use the shared fallback; no wrapper synthesis is required.
// Supplied values and defaults keep their source branches and independent claims. Instance claims retain their own receivers.
function h1(o) {
  const {
    A: {
      B: {
        groupBy: s
      }
    } = {
      B: _Map
    }
  } = o;
  return s;
}
const {
  A: {
    B: {
      try: t2
    }
  } = {
    B: _Promise
  }
} = {};
function h3(o) {
  const {
    A: {
      B: {
        C: {
          from: f
        }
      }
    } = {
      B: {
        C: _Iterator
      }
    }
  } = o;
  return f;
}
function h4(o) {
  const {
    A: [{
      fromEntries: e
    }] = [Object]
  } = o;
  return e;
}
function h5(o) {
  const {
      A: {
        B: _ref
      } = {
        B: _Promise
      }
    } = o,
    w = _ref === _Promise ? _Promise$withResolvers : _ref.withResolvers,
    nm = _nameMaybeFunction(_ref);
  return [w, nm];
}
function h6(o) {
  let c;
  ({
    A: {
      B: {
        concat: c
      }
    } = {
      B: _Iterator
    }
  } = o);
  return c;
}
function h7({
  A: {
    B: {
      fromAsync: a
    }
  } = {
    B: Array
  }
} = {}) {
  return a;
}
function h8(o) {
  const {
    A: {
      B: {
        at
      }
    } = {
      B: {
        at: _atMaybeArray([1, 2])
      }
    }
  } = o;
  return at;
}
for (const {
  A: {
    B: {
      sumPrecise: sp
    }
  } = {
    B: Math
  }
} of [{}]) use(sp);
try {
  throw {};
} catch ({
  A: {
    B: {
      isError: ie
    }
  } = {
    B: Error
  }
}) {
  use(ie);
}
const G = [Array];
function h11(o) {
  const {
    A: [{
      of: so
    }] = G
  } = o;
  return so;
}
use(h1, t2, h3, h4, h5, h6, h7, h8, h11);