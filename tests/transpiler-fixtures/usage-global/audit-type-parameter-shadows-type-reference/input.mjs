// a type reference naming a TYPE PARAMETER in scope names that parameter, never the global: the
// parameter of an interface, a function, a class, an alias, and the `infer` of a conditional's true
// branch all shadow, so not one of those names may reach the import set. outside their scope the
// same name is the global again - the conditional's FALSE branch and the unparameterized sibling
// are the two rows that must inject, one module each
export interface Box<Set> { v: Set }
export function f<WeakSet>(v: WeakSet): WeakSet { return v; }
export class C<WeakMap> { m(v: WeakMap): void {} }
export type F<Symbol> = (v: Symbol) => Symbol;
export type Picked<T> = T extends Array<infer Promise> ? Promise : never;
export type Fallen<T> = T extends Array<infer SuppressedError> ? 1 : SuppressedError;
export interface Plain { v: Reflect }
