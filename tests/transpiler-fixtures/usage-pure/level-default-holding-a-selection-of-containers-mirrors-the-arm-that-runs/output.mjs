import _Array$from from "@core-js/pure/actual/array/from";
import _Array$of from "@core-js/pure/actual/array/of";
import _Iterator$from from "@core-js/pure/actual/iterator/from";
import _Map$groupBy from "@core-js/pure/actual/map/group-by";
import _Object$hasOwn from "@core-js/pure/actual/object/has-own";
import _Promise$allSettled from "@core-js/pure/actual/promise/all-settled";
// A level default holding a selection of containers reads the slot of the arm that runs where it fires:
// a selection the build decides mirrors its live arm alone, an undecided one mirrors every arm - under an
// object level, an array level and an element default alike.
const {
  W: {
    C: {
      groupBy: viaDecided
    }
  } = {
    C: {
      groupBy: _Map$groupBy
    }
  }
} = {};
const {
  V: {
    C: {
      from: viaUndecided
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
} = {};
const {
  U: {
    C: {
      allSettled: viaFreshLeft
    }
  } = {
    C: {
      allSettled: _Promise$allSettled
    }
  }
} = {};
const {
  T: [{
    hasOwn: viaArrayLevel
  }] = [{
    hasOwn: _Object$hasOwn
  }]
} = {};
const [{
  C: {
    of: viaElement
  }
} = {
  C: {
    of: _Array$of
  }
}] = [];
export { viaDecided, viaUndecided, viaFreshLeft, viaArrayLevel, viaElement };