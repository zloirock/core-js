// Array-contained navigation keeps its native slot boundaries, including optional and stored receivers.
// Receiver defaults and other independently supported static routes retain their own claims.
let n = 0;
let w;
let getPrototypeOf;
export const [{ of }] = [globalThis.self.Array];
export const [{ trunc }] = [globalThis.self.window.Math];
export const [{ from }] = [(globalThis.window).self.Array];
export const [{ keys }] = [globalThis.window?.self.Object];
export const [{ entries }] = [(n++, globalThis.self).Object];
export const [{ values }] = [(w = globalThis.self).Object];
// The assignment-form wrapper retains its native static read.
[{ getPrototypeOf }] = [globalThis.self.Object];
// An additional array level retains the same native static boundary.
export const [[{ freeze }]] = [[globalThis.self.Object]];
// An absent element evaluates its receiver default, whose supported static is served.
export const [{ seal } = globalThis.self.Object] = [];
// A direct constructor member inside an array remains a native static source.
export const [{ isArray }] = [globalThis.Array];
// The flat object-pattern twin keeps its direct static extraction.
export const { getOwnPropertyNames } = globalThis.self.Object;
