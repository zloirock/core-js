// the block-scoped `var _ref;` anchors immediately after the block's `{`, and for tight
// nested-block shapes that anchor coincides with the wrapped body's own start. the ref must
// stay INSIDE the block either way - dropping it at the boundary leaves _ref undeclared
const { from } = ((() => {var x = [1, 2, 3].at(0); return Array;})(), Array);
console.log(from);
