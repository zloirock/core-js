import _Map$groupBy from "@core-js/pure/actual/map/group-by";
import _Object$groupBy from "@core-js/pure/actual/object/group-by";
// A paired constructor selection uses the common branch mirror inside its literal wrapper.
const {
  C: {
    groupBy
  }
} = {
  C: flag ? {
    groupBy: _Object$groupBy
  } : {
    groupBy: _Map$groupBy
  }
};
use(groupBy);