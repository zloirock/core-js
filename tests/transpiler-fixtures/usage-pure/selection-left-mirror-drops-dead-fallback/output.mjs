import _Array$of from "@core-js/pure/actual/array/of";
import _Iterator$from from "@core-js/pure/actual/iterator/from";
import _Map$groupBy from "@core-js/pure/actual/map/group-by";
import _Object$fromEntries from "@core-js/pure/actual/object/from-entries";
import _Object$groupBy from "@core-js/pure/actual/object/group-by";
import _Promise$withResolvers from "@core-js/pure/actual/promise/with-resolvers";
import _WeakSet from "@core-js/pure/actual/weak-set/constructor";
// A selection whose LEFT holds a mirrored leaf gives way to that left: the literal is always defined,
// so the right is dead and drops even where an effect keeps the selection from collapsing whole - in an
// arm of a conditional default, in a container slot, beside an effect in the right. A left that may be
// falsy keeps its right live and mirrored, a name a pattern binds to `null` included.
let n = 0;
const [held] = [null];
function arm(o) {
  const {
    A: {
      from
    } = c ? {
      from: _Iterator$from
    } : _WeakSet
  } = o;
  return from;
}
const {
  B: {
    groupBy
  }
} = {
  B: c ? {
    groupBy: _Object$groupBy
  } : {
    groupBy: _Map$groupBy
  }
};
function effectInRight(o) {
  const {
    C: {
      withResolvers
    } = {
      withResolvers: _Promise$withResolvers
    }
  } = o;
  return withResolvers;
}
function liveRight(o) {
  const {
    D: {
      fromEntries
    } = maybe || {
      fromEntries: _Object$fromEntries
    }
  } = o;
  return fromEntries;
}
function heldLeft(o) {
  const {
    E: {
      of
    } = held || {
      of: _Array$of
    }
  } = o;
  return of;
}
export { arm, groupBy, effectInRight, liveRight, heldLeft, n };