// A running initializer is read once before its extracted binding.
// A later native default observes that binding, not its TDZ.
const holder = { get A() { note('init'); return Array; } };
const { from, make = from } = holder.A;
use(make([7]));
