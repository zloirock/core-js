// Two declarators destructure statics, the first off a sequence whose prefix calls a function with a
// polyfilled method inside, the second off the plain constructor: the prefix runs first as a statement
// of its own, the method's memo staying inside its function, and each static extracts as a
// declaration of its own.
const { from } = ((function () { return [1].at(0); })(), Array),
  { of } = Array;
from([2]);
of(3);
