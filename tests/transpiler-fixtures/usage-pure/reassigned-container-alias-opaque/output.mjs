// A third source the file cannot enumerate makes the aliased holder opaque.
// Pure leaves the unresolved slot read intact instead of forcing it to String.raw.
// Replacing the alias does not hand String out or require a namespace import.
let first = {
  x: Number
};
let second = {
  x: String
};
first = second;
first = external;
const {
  x: {
    raw
  }
} = first;