// nested method declaration with its own return type does not narrow the outer function return;
// outer call resolves through the array literal return so `.at` polyfill emits array-instance
function getOuter() {
  const inner = { method() { return 'string'; } };
  return [1, 2, 3];
}
getOuter().at(-1);
