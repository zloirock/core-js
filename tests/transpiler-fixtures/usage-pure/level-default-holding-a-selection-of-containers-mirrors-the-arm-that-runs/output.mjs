import _Iterator from "@core-js/pure/actual/iterator/constructor";
import _Map from "@core-js/pure/actual/map/constructor";
import _Promise from "@core-js/pure/actual/promise/constructor";
// Literal-container static/global leaves use the shared fallback; no wrapper synthesis is required.
// Supplied values and defaults keep their source branches and independent claims.
const {
  W: {
    C: {
      groupBy: viaDecided
    }
  } = {
    C: _Map
  }
} = {};
const {
  V: {
    C: {
      from: viaUndecided
    }
  } = c ? {
    C: Array
  } : {
    C: _Iterator
  }
} = {};
const {
  U: {
    C: {
      allSettled: viaFreshLeft
    }
  } = {
    C: _Promise
  }
} = {};
const {
  T: [{
    hasOwn: viaArrayLevel
  }] = [Object]
} = {};
const [{
  C: {
    of: viaElement
  }
} = {
  C: Array
}] = [];
export { viaDecided, viaUndecided, viaFreshLeft, viaArrayLevel, viaElement };