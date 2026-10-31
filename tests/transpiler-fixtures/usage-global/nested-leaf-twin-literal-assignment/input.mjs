// A discarded nested assignment carries its prefix and paired receiver once.
// The second leaf remains on the extracted value.
let method, length;
({ data: { at: method, length } } = (effect('prefix'), { data: give() }));
use(method, length);
