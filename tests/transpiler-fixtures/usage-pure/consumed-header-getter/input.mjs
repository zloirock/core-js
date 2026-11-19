// The nested static consumes the pattern, not its initializer getter.
const holder = { get box() { effect(); return { A: Array }; } };
for (let { A: { from } } = holder.box, i = 0; i < 1; i++) use(from);
