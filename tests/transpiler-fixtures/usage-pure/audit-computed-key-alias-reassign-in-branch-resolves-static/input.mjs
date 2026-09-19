// usage-pure: the key alias K is reassigned in an if-branch AFTER the use - the branch runs after
// `Array[K]` (or not at all), so K is still 'from' at the call and pure substitutes `_Array$from`.
// exercises the textually-after check against a reassignment sitting under a conditional guard.
function f(c) {
  let K = "from";
  Array[K]([1, 2, 3]);
  if (c) {
    K = "of";
  }
}
