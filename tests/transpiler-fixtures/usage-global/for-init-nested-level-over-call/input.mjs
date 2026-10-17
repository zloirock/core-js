// a loop head destructuring a nested level off a call, a `new` or a member of a call: the dispatch
// reads that init itself, the source's one evaluation of it, so the header keeps no discarded copy
// beside the extraction - a copy would run the init a second time. every declarator kind takes the
// same shape, a declarator followed by another included
for (const { y: { at } } = mk(); ;) break;
for (let { y: { flat } } = new Box(), i = 0; i < 1; i++) use(flat, i);
for (var { data: { includes } } = load().inner; ;) break;
