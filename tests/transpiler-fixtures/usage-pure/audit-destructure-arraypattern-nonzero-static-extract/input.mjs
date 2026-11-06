// A hole before a constructor keeps its exact array position.
// The static read stays native while its result narrows the later at call to an array.
const [, { from }] = [Set, Array];
const arr = from([1, 2, 3]);
arr.at(0);
