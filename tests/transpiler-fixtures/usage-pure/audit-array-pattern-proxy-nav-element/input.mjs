// Literal-container static/global leaves use the shared fallback; no wrapper synthesis is required.
// Native iteration, source effects and residual bindings stay in order.
let n = 0;
let w;
let getPrototypeOf;
export const [{ of }] = [globalThis.self.Array];
export const [{ trunc }] = [globalThis.self.window.Math];
export const [{ from }] = [(globalThis.window).self.Array];
export const [{ keys }] = [globalThis.window?.self.Object];
export const [{ entries }] = [(n++, globalThis.self).Object];
export const [{ values }] = [(w = globalThis.self).Object];
[{ getPrototypeOf }] = [globalThis.self.Object];
export const [[{ freeze }]] = [[globalThis.self.Object]];
export const [{ seal } = globalThis.self.Object] = [];
export const [{ isArray }] = [globalThis.Array];
export const { getOwnPropertyNames } = globalThis.self.Object;
