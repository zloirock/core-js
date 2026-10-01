// The author mixed the two: a live `import` beside `module.exports`. No spelling makes that file
// loadable, so the injection takes the one that leaves it no worse - the ESM the author KEEPS
// decides, and a `require` at the top would fail under the only loader that accepts the rest.
// The mixture itself is reported rather than passed over.
import dep from "./dep";
[1, 2, 3].at(0);
module.exports = dep;
