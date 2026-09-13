// A write through a reassigned holder reaches the aliased container's slot.
// The replaced slot prevents a forced receiver substitution; its native read stays intact.
let first = {
  x: Number
};
let second = {
  x: String
};
first = second;
first.x = Array;
const {
  x: {
    from
  }
} = second;