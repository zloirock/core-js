// imported binding called as instance method: `import { items }` then `items.flat()`.
// without a known type, the call must fall back to generic instance dispatch
import { items } from './data';
const result = items.flat();
