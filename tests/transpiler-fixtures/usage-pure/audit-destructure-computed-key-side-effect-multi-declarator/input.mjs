// A computed static key shares its declaration with an earlier declarator. The receiver capture,
// key effect and pure static binding remain in that declarator slot, before the following
// statement.
const first = 1, { [(effectful(), 'from')]: from } = Array;
const probe = [1, 2].includes(2);
