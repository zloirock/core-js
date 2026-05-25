import _Array$from from "@core-js/pure/actual/array/from";
import _Iterator$from from "@core-js/pure/actual/iterator/from";
// `cond ? (0, Array) : Iterator` - SE prefix `0` is side-effect free; safe-SE peel reaches
// the SE tail (Array) and per-branch synth-swap fires. each branch ends up with its own
// polyfill object literal; SE prefix preserved verbatim around the substitution target
const {
  from
} = cond ? (0, {
  from: _Array$from
}) : {
  from: _Iterator$from
};
from([1, 2, 3]);