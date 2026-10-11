import _Array$from from "@core-js/pure/actual/array/from";
import _Iterator$from from "@core-js/pure/actual/iterator/from";
import _Map$groupBy from "@core-js/pure/actual/map/group-by";
import _Object$groupBy from "@core-js/pure/actual/object/group-by";
import _Promise$allSettled from "@core-js/pure/actual/promise/all-settled";
// A catch parameter binds a value no host spells, so the default alone is mirrored where it fires: a
// selection the build decides mirrors its live operand, an undecided one every arm - flat and through a
// container level alike.
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
      C: {
        from: _Array$from
      }
    } : {
      C: {
        from: _Iterator$from
      }
    }
  }) {
    return from;
  }
}