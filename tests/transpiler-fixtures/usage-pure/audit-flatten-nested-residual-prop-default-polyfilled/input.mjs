// Residual defaults beside nested statics keep their own polyfill rewrites.
// Every surviving sibling remains live, including multiple defaults under one hop.
const { Array: { from, withAt = [1].at(0) } } = globalThis;
const { Promise: { resolve, withAny = Promise.any([2]) } } = globalThis;
const { Object: { fromEntries, twoA = [3].at(0), twoB = [4].flat() } } = globalThis;
from([5]); resolve(6); fromEntries([]); withAt; withAny; twoA; twoB;
