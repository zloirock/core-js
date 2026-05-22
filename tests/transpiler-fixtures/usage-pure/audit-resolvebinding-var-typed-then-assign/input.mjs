// `var arr: string[]` declared without init, then assigned: the declared annotation
// narrows the binding to array. Distinct array-instance methods on each line, so each
// emitted polyfill maps to its source call.
var arr: string[];
arr = ['x', 'y', 'z'];
arr.findLast(s => s);
arr.at(0);
arr.includes('y');
