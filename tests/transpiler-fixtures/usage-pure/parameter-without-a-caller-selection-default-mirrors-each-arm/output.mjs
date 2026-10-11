import _Array$from from "@core-js/pure/actual/array/from";
import _Iterator$from from "@core-js/pure/actual/iterator/from";
import _Map$groupBy from "@core-js/pure/actual/map/group-by";
import _Object$groupBy from "@core-js/pure/actual/object/group-by";
// A parameter no call site fills binds a value no host spells, so an inner default holding an undecided
// selection is mirrored arm by arm where it fires, the parameter's own value left native - flat, and as
// a selection of containers on a level under the parameter's own default.
export function viaParameter({
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
export function viaLevel({
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
} = {}) {
  return from;
}