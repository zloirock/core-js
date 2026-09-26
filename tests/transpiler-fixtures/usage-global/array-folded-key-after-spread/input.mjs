// The trailing spread runs before the folded computed key selects `at`.
// Global usage still injects that instance method from the array element.
let visits = 0;
const tail = { [Symbol.iterator]() { visits++; return [1][Symbol.iterator](); } };
const [{ [(visits++, 'at')]: at }] = [Array.prototype, ...tail];
export { at, visits };
