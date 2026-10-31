// Every host keeps the RHS value and runs its effects before the target writes.
let of, from;
function make() { consume(of); return Array; }
const held = ({ of, from } = make());
consume(held === Array, of(1), from([2]));
const tail = (consume(), ({ of, from } = globalThis.Array));
consume(tail === Array);
const branch = (({ of, from } = consume() ? Array : Array), 7);
if (({ of, from } = Array)) consume(of, from);
const read = () => ({ of, from } = make());
consume(read() === Array);
label: ({ of, from } = make());
// A foreign branch retains its own values.
const foreign = { of: undefined, from: undefined };
const custom = ({ of, from } = consume() ? foreign : Array);
consume(custom, of, from, branch);
