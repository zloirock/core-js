// a proxy-global flatten leaf (`Array.from` via globalThis) sharing its declaration with a
// side-effecting-computed-key sibling (`Array.of` under a key whose sequence prefix must run once):
// the flatten owns the whole declaration render, so the SE-key extraction must bake its
// value->sentinel rename into the residual slice. it used to float and swap, binding the sentinel to
// the polyfill (`_unused = _Array$of`) and leaving the real binding native in the residual
const effects = [];
const { Array: { from } } = globalThis, { [(effects.push('k'), 'of')]: of } = Array;
export const r = [typeof from, typeof of, effects.length];
export { effects };
