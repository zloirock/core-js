// Proven constructors keep distinct array and string dispatchers.
// Each method exposes an extra import if its receiver loses that precision.
new Array(1, 2, 3).at(-1);
new String('abc').includes('b');
