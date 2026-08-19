// the global-flavor twin of the pure fixture that locks the array-pattern build error: here the
// source is kept and only the import set is the observable, so what this locks is that detection
// still reaches every static through these nav shapes - the receiver-collapse channel that crashed
// is pure-only.
let n = 0;
let w;
let getPrototypeOf;
export const [{ of }] = [globalThis.self.Array];
export const [{ trunc }] = [globalThis.self.window.Math];
export const [{ from }] = [(globalThis.window).self.Array];
export const [{ keys }] = [globalThis.window?.self.Object];
export const [{ entries }] = [(n++, globalThis.self).Object];
export const [{ values }] = [(w = globalThis.self).Object];
// the ASSIGNMENT form takes the CASCADE render instead of the flatten's - and only when the
// destructured name resolves to a static, which is what makes that render replace the statement
[{ getPrototypeOf }] = [globalThis.self.Object];
// a NESTED array pattern reaches the same render through one more wrapper
export const [[{ freeze }]] = [[globalThis.self.Object]];
// a pattern DEFAULT puts the nav in the slot the flatten rewrites rather than in the init
export const [{ seal } = globalThis.self.Object] = [];
// NEGATIVE: a single-hop nav needs no receiver collapse, so nothing is queued inside
export const [{ isArray }] = [globalThis.Array];
// NEGATIVE: the object-pattern host was never affected - it renders through the same flatten
export const { getOwnPropertyNames } = globalThis.self.Object;
