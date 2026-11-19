// destructure default in static destructure: `const { from = () => [] } = Array`. the
// default is unreachable (Array is non-nullable), but the binding must still register
// as an Array.from alias so subsequent instance methods narrow to array-specific entries
const { from = () => [] } = Array;
const arr = from('hi');
arr.at(-1);
arr.findLast(p => p);
arr.copyWithin(0, 1);
