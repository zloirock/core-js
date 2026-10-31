import _Map from "@core-js/pure/actual/map/constructor";
import _Map$groupBy from "@core-js/pure/actual/map/group-by";
import _Object$fromEntries from "@core-js/pure/actual/object/from-entries";
import _Promise from "@core-js/pure/actual/promise/constructor";
import _Promise$try from "@core-js/pure/actual/promise/try";
import _Promise$withResolvers from "@core-js/pure/actual/promise/with-resolvers";
// a default spelled as a member off a CALL (`= g().M`) serves the static read through it, running the
// call only where the default fires, as the flat read `g().M.groupBy` does - computed, top-level, and
// through a name the call's value was stored under
function g() {
  log();
  return {
    M: _Map,
    P: _Promise,
    O: Object
  };
}
function h1(o) {
  const {
    A: {
      groupBy: s
    } = (g().M, {
      groupBy: _Map$groupBy
    })
  } = o;
  return s;
}
const {
  A: {
    try: t
  } = (g().P, {
    try: _Promise$try
  })
} = {};
function h3(o) {
  const {
    A: {
      fromEntries: e
    } = (g()['O'], {
      fromEntries: _Object$fromEntries
    })
  } = o;
  return e;
}
const G = g();
function h4(o) {
  const {
    A: {
      withResolvers: w
    } = {
      withResolvers: _Promise$withResolvers
    }
  } = o;
  return w;
}
use(h1, t, h3, h4);