// Both skipped elements are arrays. Only the third slot supplies a string.
const [,, third] = [[1], [2], 'c'];
third.at(0);

// The same pattern selects an array when only the third slot is an array.
const [,, last] = ['a', 'b', [3]];
last.includes(3);
