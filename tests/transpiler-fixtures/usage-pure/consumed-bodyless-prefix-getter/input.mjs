// Lifting the source prefix does not pay for the getter after it.
const holder = { get box() { effect(); return { A: Array }; } };
let from;
if (condition) ({ A: { from } } = (prefix(), holder.box));
use(from);
