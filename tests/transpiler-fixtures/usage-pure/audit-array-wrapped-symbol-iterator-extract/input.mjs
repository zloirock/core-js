// a `[Symbol.iterator]`-keyed binding under an ArrayPattern wrapper extracts through the
// iterator-method helper off the POSITIONAL init element, like the plain-declarator form:
// a rest sibling keeps the re-keyed sentinel in the preserved wrapper (array siblings and
// holes survive untouched); a fully-consumed pattern drops the whole declarator instead
const [{ [Symbol.iterator]: it, ...r }, tail] = [arr, 0];
it;
r;
tail;
const [{ [Symbol.iterator]: single }] = [other];
single;
