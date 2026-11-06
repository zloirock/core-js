import _Array$from from "@core-js/pure/actual/array/from";
import _Map$groupBy from "@core-js/pure/actual/map/group-by";
// Nested statics in an outer declaration and sibling IIFE are served independently.
const {
    Array: {
      from
    }
  } = {
    Array: {
      from: _Array$from
    }
  },
  outer = function () {
    const {
      Map: {
        groupBy
      }
    } = {
      Map: {
        groupBy: _Map$groupBy
      }
    };
    return groupBy;
  }();
console.log(from, outer);