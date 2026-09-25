// A computed static key shares its declaration with an earlier declarator. The key effect and the
// pure static binding stay in that declarator slot, before the following statement; the proven
// constructor receiver needs no capture.
const first = 1, { [(effectful(), 'from')]: from } = Array;
const probe = [1, 2].includes(2);
