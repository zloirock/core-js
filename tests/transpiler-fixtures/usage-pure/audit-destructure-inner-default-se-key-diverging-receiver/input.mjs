// an effectful computed key spelled through a bound CALL (`[key()]` - a block body with a prefix
// statement, `[k('from')]` - an identity callee handing its argument back) names its slot by the
// callee's return, and the receiver is a diverging conditional: the mirror spells the polyfill on the
// realm arm and keeps the key in the pattern (it runs once), through an element default (`= {}`),
// with no default, with no array wrapper and with the default on the hop's own value alike - both
// legs read the SAME receiver (the element, never the default it guards) and the same key
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
