// a `[Symbol.iterator]`-keyed binding nested under an object property extracts off the
// receiver walked along the nesting keys: a rest sibling keeps the re-keyed sentinel in
// the surviving residual; a sole-binding pattern with an effect-free init drops the whole
// declarator, leaving only the extracted binding
const { y: { [Symbol.iterator]: it, ...r } } = { y: arr };
it;
r;
const { z: { [Symbol.iterator]: single } } = { z: other };
single;
