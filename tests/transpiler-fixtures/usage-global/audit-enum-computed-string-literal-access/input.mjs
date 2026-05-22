// String enum accessed with both identifier (`E.Alpha`) and computed string-literal
// (`E['Alpha']`) keys: every member resolves to its string value, so `.repeat`,
// `.at`, `.includes` each emit only the string-instance polyfill.
enum E { Alpha = 'alpha', Beta = 'beta' }
function probe() {
  E.Alpha.repeat(2);
  E['Beta'].at(0);
  E['Alpha'].includes('a');
}
probe();
