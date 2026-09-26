// an UNRESOLVABLE computed key bails the whole synth (later-key-wins would let the raw
// read overwrite a polyfilled sibling, and the key would evaluate twice)
export const f = (function ({ at, [window.k]: alias } = [1, 2]) { return [at, alias]; })();
// a `__proto__` pattern key spells COMPUTED-STRING in the synth literal: an own property,
// not the prototype-setter form - the literal keeps its own prototype
export const g = (function ({ __proto__: p, at } = [1, 2]) { return [p, at]; })();
// a WELL-KNOWN-SYMBOL key through a bound alias joins the synth: the slot renders the
// method lookup (`getIteratorMethod(recv)`), not a raw pure-symbol read
const s = Symbol.iterator;
export const h = (function ({ at, [s]: it } = [1, 2]) { return [at, it]; })();
// a STRING spelling of a symbol's own name is an ordinary property, never the symbol: the
// slot keeps the plain read (reading it through the symbol would substitute a different value)
export const s2 = (function ({ at, ["Symbol.iterator"]: x } = [1, 2]) { return [at, x]; })();
// a FOLDED computed key reads back COMPUTED with its own string, whatever produced the fold:
// a side-effecting key whose prefix stays on the pattern, and a plain string literal
export const s3 = (function ({ at, [(effect(), "k")]: v } = [1, 2]) { return [at, v]; })();
export const s4 = (function ({ at, ["z"]: z } = [1, 2]) { return [at, z]; })();
