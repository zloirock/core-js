// `const [...{ length }] = arr` - ObjectPattern in ArrayPattern rest element. the rest
// slice is the array tail; destructuring it as `{ length }` reads Array.prototype.length.
// findArrayPatternKeyPath handles the ObjectPattern-in-rest branch (alongside the existing
// ArrayPattern-in-rest handling) so the binding resolves through the Array element shape
const arr = [1, 2, 3];
const [...{
  length
}] = arr;
export { length };