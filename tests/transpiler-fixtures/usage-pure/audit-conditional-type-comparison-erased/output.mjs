// Conditional comparison operands do not describe a flowing value, so their globals
// require no polyfill. The rule covers both operands and every nested type position.
export type Checked<T> = Number extends T ? string : boolean;
export type Nested<T> = T extends Array<Number> ? string : boolean;
export type Signature<T> = T extends ((value: Number) => unknown) ? string : boolean;
declare const queried: string extends typeof Number ? string : boolean;
declare const qualified: string extends globalThis.Number ? string : boolean;
export { queried, qualified };