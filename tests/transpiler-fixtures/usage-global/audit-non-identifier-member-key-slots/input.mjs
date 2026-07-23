// keys that are NOT identifiers route around member-name detection entirely: a string-literal key, a
// numeric key and a private name can each carry a global-shaped spelling while never being a reference,
// so none of them may inject. each names a global used NOWHERE else, so any import for it is a false
// positive; the last line is the positive control. distinct method per line.
class Str { "Set"(): void; "Set"(x?: number) {} }
abstract class Num { abstract 1: number; }
class Priv { #WeakMap = 1; read() { return this.#WeakMap; } }
export const r = [[1], [2]].flat();
export { Str, Num, Priv };
