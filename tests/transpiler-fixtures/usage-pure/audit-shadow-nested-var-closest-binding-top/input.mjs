// A nested var belongs to its function and shadows an outer binding throughout that function. A read must resolve that local
// binding even before its initializer executes.
var iterator = Symbol.iterator;
export const top = [][iterator];
