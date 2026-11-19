// A sole nested level under an iterator key that runs an effect reads the slot once, after the effect: the
// receiver memoizes and the level destructures the helper result of the iterator method behind the key's
// effect, null-guarded where the receiver may be nullish - on a declaration, a loop head, a catch parameter.
const { [(mark(), Symbol.iterator)]: { next } } = [1, 2];
const { [(mark(), Symbol.iterator)]: { length } } = getText();
for (const { [(mark(), Symbol.iterator)]: { call } } of lists) use(call);
try {
  run();
} catch ({ [(mark(), Symbol.iterator)]: { bind } }) {
  use(bind);
}
const it = Symbol.iterator;
const { [(mark(), it)]: { name } } = getSet();
export { next, length, name };
