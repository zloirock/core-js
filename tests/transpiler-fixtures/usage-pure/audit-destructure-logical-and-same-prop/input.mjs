// `const { from } = Array && Array` - both operands resolve to the same global object (Array).
// under a truthy left the right is returned (`Array.from`); a falsy left would make the whole
// `&&` result falsy and destructuring would throw TypeError, so the polyfill is only consumed
// when runtime has settled on `Array`. plugin now applies the direct polyfill in this case
// instead of the conservative `fromFallback` bail it used for mixed-receiver `X && Y` shapes
const { from } = Array && Array;
from([1, 2, 3]);
