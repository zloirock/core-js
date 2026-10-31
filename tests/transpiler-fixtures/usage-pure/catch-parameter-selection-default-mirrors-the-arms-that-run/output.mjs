import _Iterator from "@core-js/pure/actual/iterator/constructor";
import _Map$groupBy from "@core-js/pure/actual/map/group-by";
import _Object$groupBy from "@core-js/pure/actual/object/group-by";
import _Promise$allSettled from "@core-js/pure/actual/promise/all-settled";
// Literal-container static/global leaves use the shared fallback; no wrapper synthesis is required.
// Supplied values and defaults keep their source branches and independent claims.
export function viaDecided(g) {
  try {
    g();
  } catch ({
    W: {
      allSettled
    } = {
      allSettled: _Promise$allSettled
    }
  }) {
    return allSettled;
  }
}
export function viaUndecided(g) {
  try {
    g();
  } catch ({
    W: {
      groupBy
    } = c ? {
      groupBy: _Map$groupBy
    } : {
      groupBy: _Object$groupBy
    }
  }) {
    return groupBy;
  }
}
export function viaUndecidedContainer(g) {
  try {
    g();
  } catch ({
    W: {
      C: {
        from
      }
    } = c ? {
      C: Array
    } : {
      C: _Iterator
    }
  }) {
    return from;
  }
}