// A positional var read in its own initializer stops the value walk.
// Neighbouring instance claims must not make transformation recurse.
var [{
  a: v,
  values
}, {
  inner: {
    includes
  },
  k: M
} = []] = [list, M];
consume(v, values, includes, M);