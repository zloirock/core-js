// nested destructure with intermediate ArrayPattern wrapper (`{ x: [{ y: { from } }] } = obj`)
// the inner ArrayPattern lives between Property `x` and Property `y` - its depth
// must accumulate through subsequent Property iterations so the host descent reflects
// the true runtime structure. without accumulation the walk silently treats `obj.x.y`
// as `Array`, injecting a polyfill that would never fire at runtime
const obj = {
  x: {
    y: Array
  }
};
const {
  x: [{
    y: {
      from
    }
  }]
} = obj;
from([1, 2, 3]);