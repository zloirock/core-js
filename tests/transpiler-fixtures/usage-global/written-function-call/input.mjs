// A function written into an initially missing slot returns an array.
// Infer the call result separately from the function value.
const box = {};
box.fn = () => [8, 9];
use(box.fn().at(-1));
