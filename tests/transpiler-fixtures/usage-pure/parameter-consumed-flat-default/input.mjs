// A named object parameter consumes Array at supplied and defaulted call sites.
// Repeated calls cannot reuse an extraction belonging to a different argument.
function read({ from } = Array) { return from; }
function ownFrom(value) { return value; }
read(Array)([1]);
read(Array)([2]);
read()([3]);
read(undefined)([4]);
read({ from: ownFrom })(5);
