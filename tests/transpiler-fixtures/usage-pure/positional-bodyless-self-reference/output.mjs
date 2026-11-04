// A bodyless positional declaration keeps its cyclic value unknown.
// The earlier instance binding is visible to the later initializer element.
if (flag) var [{
  a: v,
  values
}, {
  inner: {
    includes
  },
  k: M
} = []] = [list, includes];
consume(v, values, includes, M);