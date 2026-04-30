// top-level conditional fallback where BOTH branches resolve to viable polyfills
// (Array.from and Iterator.from both exist as static methods). asserts per-branch
// synth-swap fires for both branches yielding `cond ? {from: _Array$from} : {from: _Iterator$from}`
const cond = Math.random() > 0.5;
const { from } = cond ? Array : Iterator;
export { from };
