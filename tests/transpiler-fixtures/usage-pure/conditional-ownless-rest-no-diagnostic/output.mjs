import _Set from "@core-js/pure/actual/set";
import _WeakMap from "@core-js/pure/actual/weak-map";
// Neither branch has this static, so an untouched rest pattern needs no candidate warning.
const {
  banana,
  ...rest
} = choice ? _Set : _WeakMap;
use(banana, rest);