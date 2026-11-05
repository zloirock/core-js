// Cross-alias stores preserve the current container instead of recursing through stale initializers.
// The nested raw read remains native.
let first = {
  x: Number
};
let second = {
  x: String
};
first = second;
second = first;
const {
  x: {
    raw
  }
} = first;