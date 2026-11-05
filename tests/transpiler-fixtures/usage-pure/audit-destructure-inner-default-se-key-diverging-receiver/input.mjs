// Effectful keys under selecting realm receivers retain their own capture and default boundaries.
// Supported branch claims use Array.from while native wrapper forms keep their original reads.
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
// the control: the literal spelling of the same effectful key
const [{ Array: { [(calls += 1, 'from')]: literalKey } } = {}] = [pick ? globalThis : Set];
export { extracted, noDefault, noWrapper, valueDefault, viaIdentity, literalKey, calls };
