// Each positional leaf has its own type, even when an earlier leaf causes head relocation.
// Array at and string includes must not inherit one another's receiver type.
const rows = [[1], '02'];
for (const [{ at }, { includes }] of [rows]) use(at, includes);
