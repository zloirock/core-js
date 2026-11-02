// A constructor before the nested static keeps its original binding through the split.
// The initializer prefix and rest exclusion each run once.
const { Map: Local, Math: { trunc }, ...rest } = (effect(), globalThis);
use(trunc, Local, rest);
