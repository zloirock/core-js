// Shared capture and receiver-default routes preserve independently supported claims.
// Supplied values and defaults keep their source branches and independent claims.
let pick = 1;
let calls = 0;
const key = () => {
  calls += 1;
  return 'from';
};
const k = tag => (calls += 1, tag);
const [{ Array: { [key()]: extracted } } = {}] = [pick ? globalThis : Set];
const [{ Array: { [key()]: noDefault } }] = [pick ? globalThis : Set];
const { Array: { [key()]: noWrapper } } = pick ? globalThis : Set;
const { Array: { [key()]: valueDefault } = {} } = pick ? globalThis : Set;
const { Array: { [k('from')]: viaIdentity } } = pick ? globalThis : Set;
const [{ Array: { [(calls += 1, 'from')]: literalKey } } = {}] = [pick ? globalThis : Set];
export { extracted, noDefault, noWrapper, valueDefault, viaIdentity, literalKey, calls };
