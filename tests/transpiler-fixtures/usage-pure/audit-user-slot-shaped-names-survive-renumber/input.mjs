// user names that LOOK like generated refs but are not bindings - object keys, a class field and
// its reads, a label with its break, a private name - sit where the final renumber could touch
// them: a bodyless body wrap copies the user statement into emitted text, and the swap-inducing
// chain below makes the renumber non-identity. none of them may move: a key is a property name
// the object keeps, a label must match its break, a private name must match its declaration
export const o = { _ref: 1, _ref2: 2, _ref3: 3, _ref4: 4 };
export function labeled(c) { if (c) _ref4: for (;;) { [1].at(0); break _ref4; } }
export class C { #_ref4 = 1; m(c) { if (c) for (;;) { [this.#_ref4].at(0); break; } } }
export function field(c) { if (c) for (;;) { class K { _ref4 = 1; m() { return [this._ref4].at(0); } } new K(); break; } }
let w;
export const r = (w = globalThis.window)?.self.Array.of(6).flat?.().map?.(x => x).at?.(0);
