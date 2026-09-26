// Nested computed keys retain their native reads after the array initializer.
// The selected Array and String receivers keep their specific instance polyfills.
const [{ [(mark(), 'items')]: { at } }] = [{ items: [2, 7] }];
let includes;
([{ [(mark(), 'text')]: { includes } }] = [{ text: 'abc' }]);
export const [{ [(mark(), 'items')]: { values } }] = [{ items: [2, 7] }];
use(at, includes);
