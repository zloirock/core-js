import _getIterator from "@core-js/pure/actual/get-iterator";
import _globalThis from "@core-js/pure/actual/global-this";
import _self from "@core-js/pure/actual/self";
// Proxy receiver hops collapse to a pure realm value while retaining their own effects.
// Receiver effects precede the computed iterator-key effects and run once.
// Optional lookup guards its key effects; sealed receiver prefixes still run once.

// A non-optional hop effect runs before the iterator-key effect.
const a = (hop(), key(), _getIterator(_self));

// Without iterator-key effects, the receiver owns its hop effect inline.
const b = _getIterator((probe(), _self));

// A sealed optional lookup guards the key effect before unconditional consumption.
const c = (null == (mark(), _self) ? void 0 : (tag(), void 0), _getIterator(_self));

// A mid-chain optional receiver runs its hop effect before the iterator key.
const d = (hop2(), key2(), _getIterator(_globalThis));
const e = (hop3(), key3(), _getIterator(_self));

// Parentheses seal the receiver's optional chain; its prefix and hop effect run before the key.
const f = (hop4(), key4(), _getIterator(_globalThis));
const g = (eff5(), hop5(), key5(), _getIterator(_globalThis));