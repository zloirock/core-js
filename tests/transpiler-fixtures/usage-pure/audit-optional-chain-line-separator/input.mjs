// optional chain with a Unicode LINE SEPARATOR between segments: line tracking must
// round-trip correctly through the rewrite.
const obj = {prop: [1]};
obj ?.prop.at(0);
