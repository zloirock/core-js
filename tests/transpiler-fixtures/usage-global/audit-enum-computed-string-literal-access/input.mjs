// Computed string-literal access on a string enum (`E['Alpha']`) used to bail in
// `resolveEnumMemberAccess` - only `E.Alpha` (Identifier property) narrowed; computed
// branch only handled numeric reverse-map (`E[E.Alpha]`). fix: `enumMemberKeyName` accepts
// both Identifier (non-computed) and StringLiteral / ESTree Literal (computed) keys.
// distinct methods per slot (.repeat baseline / .at computed / .includes computed) pin
// emission to the narrowed string member - without the fix both .at and .includes would
// over-emit their array siblings since the receiver type stayed unresolved
enum E { Alpha = 'alpha', Beta = 'beta' }
function probe() {
  E.Alpha.repeat(2);
  E['Beta'].at(0);
  E['Alpha'].includes('a');
}
probe();
