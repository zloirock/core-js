import _Array$from from "@core-js/pure/actual/array/from";
// A receiver read off a container written IN PLACE (`({ w: Array }).w`, `[Array][0]`) names a
// constructor as plainly as a binding does. The plan asked only the proxy-global resolver, which
// declines those by contract, so a peeled flat prop stayed verbatim and its leaf lost the ponyfill
// the flat twin extracts. The effect standing in the container runs ONCE either way: the hop value
// and the discard rescue harvest the same call through two spans, and only the containing one is it.
let hits = 0;
function once() {
  hits += 1;
  return {
    w: Array
  };
}
const {
  w: {
    from: nestedHop
  }
} = {
  w: {
    from: _Array$from
  }
};
const [{
  from: arrayWrapped
}] = [{
  from: _Array$from
}];
const {
  w: {
    from: effectful
  }
} = {
  w: (once().w, {
    from: _Array$from
  })
};
const {
  w: {
    from: indexed
  }
} = {
  w: {
    from: _Array$from
  }
};
export { nestedHop, arrayWrapped, effectful, indexed, hits };