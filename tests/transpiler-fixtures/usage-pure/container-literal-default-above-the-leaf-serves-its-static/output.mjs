import _Array$fromAsync from "@core-js/pure/actual/array/from-async";
import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _Array$of from "@core-js/pure/actual/array/of";
import _Error$isError from "@core-js/pure/actual/error/is-error";
import _nameMaybeFunction from "@core-js/pure/actual/function/instance/name";
import _Iterator$concat from "@core-js/pure/actual/iterator/concat";
import _Iterator$from from "@core-js/pure/actual/iterator/from";
import _Map$groupBy from "@core-js/pure/actual/map/group-by";
import _Math$sumPrecise from "@core-js/pure/actual/math/sum-precise";
import _Object$fromEntries from "@core-js/pure/actual/object/from-entries";
import _Promise from "@core-js/pure/actual/promise/constructor";
import _Promise$try from "@core-js/pure/actual/promise/try";
import _Promise$withResolvers from "@core-js/pure/actual/promise/with-resolvers";
// a CONTAINER-literal default ABOVE the leaf's level (`= { B: Map }`, `= [Object]`) holds the value
// the static is read through where the default fires: the read takes its polyfill off the literal's
// slot at any depth, beside a sibling, in a declaration, an assignment, a parameter, a loop head and a
// catch clause, and a named container default is read whole, its own declaration left as written
function h1(o) {
  const {
    A: {
      B: {
        groupBy: s
      }
    } = {
      B: {
        groupBy: _Map$groupBy
      }
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
    B: {
      try: _Promise$try
    }
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
        C: {
          from: _Iterator$from
        }
      }
    }
  } = o;
  return f;
}
function h4(o) {
  const {
    A: [{
      fromEntries: e
    }] = [{
      fromEntries: _Object$fromEntries
    }]
  } = o;
  return e;
}
function h5(o) {
  const {
    A: {
      B: {
        withResolvers: w,
        name: nm
      }
    } = {
      B: {
        withResolvers: _Promise$withResolvers,
        name: _nameMaybeFunction(_Promise)
      }
    }
  } = o;
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
      B: {
        concat: _Iterator$concat
      }
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
    B: {
      fromAsync: _Array$fromAsync
    }
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
    B: {
      sumPrecise: _Math$sumPrecise
    }
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
    B: {
      isError: _Error$isError
    }
  }
}) {
  use(ie);
}
const G = [Array];
function h11(o) {
  const {
    A: [{
      of: so
    }] = [{
      of: _Array$of
    }]
  } = o;
  return so;
}
use(h1, t2, h3, h4, h5, h6, h7, h8, h11);