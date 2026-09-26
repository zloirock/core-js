// Exported source and held expose Array through the getter, requiring its global namespace.
// Pure preserves the getter and leaves the nested static read native.
let count = 0;
const source = {
  get w() {
    count++;
    return Array;
  },
  extra: 7
};
let from, rest;
const held = {
  w: {
    from
  },
  ...rest
} = source;
export { count, from, rest, held, source };