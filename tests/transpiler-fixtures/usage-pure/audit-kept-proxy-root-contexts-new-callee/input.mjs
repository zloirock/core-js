// a claimless ctor read in a `new` callee: the render stays inside the callee parens (a bare
// optional chain is not legal there), and an absent `window` throws in source and render alike
export const newCallee = new (globalThis.window?.self.CustomOther)(1);
