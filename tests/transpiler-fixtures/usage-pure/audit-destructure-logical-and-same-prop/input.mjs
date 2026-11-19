// `const { from } = Array && Array` - both operands resolve to the same global object (Array).
// Under a truthy left the right is returned (`Array.from`); a falsy left would make the whole
// `&&` result falsy and destructuring would throw TypeError, so the polyfill is only consumed
// when runtime has settled on `Array`. The direct polyfill applies here instead of the
// conservative bail used for mixed-receiver `X && Y` shapes
const { from } = Array && Array;
from([1, 2, 3]);
