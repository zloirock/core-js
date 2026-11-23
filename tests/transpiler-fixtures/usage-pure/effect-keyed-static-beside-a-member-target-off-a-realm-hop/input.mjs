// A static read between a member target and a native slot evaluates its computed key once.
// Both the probed window and the direct realm retain the order of the three writes.
let f4, c4, f6, c6;
const o = {};
({ Array: { isArray: o.g, [(e(), "fromAsync")]: f4, custom: c4 } } = globalThis.window);
({ Array: { isArray: o.h, [(e(), 'of')]: f6, custom: c6 } } = globalThis);
