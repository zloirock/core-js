// The nested leaf shares one slot read with its surviving length.
// A preceding initializer runs before the slot, default and computed key.
const source = { get data() { effect('hop'); return undefined; } };
const lead = effect('lead'),
      { data: { [(effect('key'), 'at')]: method, length } = (effect('default'), [4, 9]) } = source;
use(lead, method, length);
