// A write can create a field absent from the named holder's initializer.
// The nested default remains guarded; its array type cannot describe the supplied string.
const row = {};
row.w = '02';
for (const { w: { at, includes } = [0, 2] } of [row]) use(at.call('02', -1), includes.call('02', '02'));
