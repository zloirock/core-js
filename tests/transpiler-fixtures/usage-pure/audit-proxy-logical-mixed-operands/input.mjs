// Object-rest keeps named slots at that level and reads through it native in usage-pure.
// Independent reads and key/default expressions still receive their own polyfills.
// Each logical operand keeps its own substitution: a realm member lands on the
// backed proxy root, while a constructor operand lands on its pure constructor.
// The selected receiver is evaluated once before binding the polyfilled property
// and copying the remaining keys.
const g = globalThis;
const { from, ...rest } = globalThis.self.Array || g.self.Set || Map;
from([1]);
