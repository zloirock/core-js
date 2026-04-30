import _Array$from from "@core-js/pure/actual/array/from";
import _Iterator$from from "@core-js/pure/actual/iterator/from";
// top-level conditional fallback where BOTH branches resolve to viable polyfills
// (Array.from and Iterator.from both exist as static methods). asserts per-branch
// synth-swap fires for both branches yielding `cond ? {from: _Array$from} : {from: _Iterator$from}`
const cond = Math.random() > 0.5;
const {
  from
} = cond ? {
  from: _Array$from
} : {
  from: _Iterator$from
};
export { from };