// 4-level nested destructure with two intermediate ArrayPattern wrappers
// (`{ x: [{ y: [{ from }] }] } = obj`). array depth must accumulate across BOTH inner
// ArrayPattern hops; without it the walk treats the leaf `from` as if destructured off
// `Array`, silently injecting a polyfill that would never fire at runtime
const obj = {
  x: {
    y: {
      from: () => null
    }
  }
};
const {
  x: [{
    y: [{
      from
    }]
  }]
} = obj;
from([1, 2, 3]);