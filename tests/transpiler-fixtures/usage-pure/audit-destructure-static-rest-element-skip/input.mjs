// rest element coexists with a static destructure: `const { from, ...rest } = Array`.
// the rest binding must not block alias registration of `from`, so subsequent calls
// still narrow the receiver to Array and instance methods dispatch array-specific
const { from, ...rest } = Array;
const arr = from('hi');
arr.at(-1);
arr.findLast(p => p);
arr.copyWithin(0, 1);
