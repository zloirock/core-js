// A container alias reassignment changes which object supplies its nested raw read.
// The literal-wrapper pattern stays native.
let first = {
  x: Number
};
let second = {
  x: String
};
first = second;
const {
  x: {
    raw
  }
} = first;