// A discarded initializer stays between its preceding and following declarators.
const holder = { get box() { effect(); return { A: Array }; } };
const before = effect(), { A: { from } } = holder.box, after = effect();
use(before, from, after);
