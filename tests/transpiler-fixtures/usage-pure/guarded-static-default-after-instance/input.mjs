// A static read after an instance extraction is inserted after the traversal.
// Its live default must receive its own polyfill before that delayed insertion.
let M = pickConstructor();
if (!M) M = Array;
const { name: first, of: method = [9].at(0) } = M;
export { first, method };
