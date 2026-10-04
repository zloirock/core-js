// A native sibling may have a getter. Read it after the effectful constructor key.
const events = [];
const { [(events.push('key'), 'Array')]: { from }, sibling } = globalThis;
use(from([7]), sibling, events);
