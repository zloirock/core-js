import "core-js/modules/es.array.at";
import "core-js/modules/es.string.at";
// a catch parameter binds the THROWN value, and no host spells it: a key named after a
// constructor binds whatever was thrown, so a static read off it stays native in both spellings.
// the typeless instance ladder needs no name, so the claim beside it still relocates the pattern
// and the constructor key rides the residual - a value boundary, not a missing host
try {
  risky();
} catch ({
  Array
}) {
  Array.from([1]);
}
try {
  risky();
} catch ({
  Object: O,
  at
}) {
  at(-1);
  O.groupBy([], v => v);
}