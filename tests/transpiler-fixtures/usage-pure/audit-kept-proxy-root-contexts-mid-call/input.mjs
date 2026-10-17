// a call in the MIDDLE of the probe chain: the render lands on the deepest member whose object
// is the pure proxy nav, and the call rides the chain's own short-circuit outside it
export const midCall = globalThis.window?.self.foo().bar;
