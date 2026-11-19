// Member and indexed reads inside literal slots remain the source of native statics.
// Effectful calls keep their call count across nested and array-wrapped hosts.
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
    w: Array
  }.w
};
const [{
  from: arrayWrapped
}] = [{
  w: Array
}.w];
const {
  w: {
    from: effectful
  }
} = {
  w: once().w
};
const {
  w: {
    from: indexed
  }
} = {
  w: [Array][0]
};
export { nestedHop, arrayWrapped, effectful, indexed, hits };