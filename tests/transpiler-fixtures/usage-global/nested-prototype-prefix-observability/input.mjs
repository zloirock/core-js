// A rebuilt nested prototype receiver drops only unobservable prefix reads.
// Getter and write prefixes still execute once before method extraction.
const quiet = { value: 0 };
const { prototype: { sort } } = (quiet.value, Array);
const observed = { get value() { effect(); return 0; } };
const { prototype: { at } } = (observed.value, String);
const { prototype: { includes } } = (count++, Array);
use(sort, at, includes);
