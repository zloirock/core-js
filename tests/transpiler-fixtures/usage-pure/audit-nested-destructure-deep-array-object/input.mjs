// 4-level nested destructure with two intermediate ArrayPattern wrappers
// (`{ x: [{ y: [{ from }] }] } = obj`). the array depths must accumulate across BOTH inner
// ArrayPattern hops while Property iterations carry an object-step depth alongside. without
// proper array-depth accumulation through subsequent Property iterations, the walk treats
// the leaf `from` as if it were destructured off `Array`, silently injecting a polyfill
// that would never fire at runtime
const obj = { x: { y: { from: () => null } } };
const { x: [{ y: [{ from }] }] } = obj;
from([1, 2, 3]);
