// a deep user-object slot stays native at depth (positional protection recurses)
const box = { Array: function () {} };
const [[{ Array: Q }]] = [[box]];
export const viaDeepUser = Q.of(1);
