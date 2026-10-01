// A loop element's named holder keeps field writes visible to nested instance reads.
// The current string value must not use its initializer's array dispatch or a dead default.
const row = { w: [0, 2] };
row.w = '02';
for (const { w: { at, includes } } of [row]) use(at.call('02', -1), includes.call('02', '02'));
