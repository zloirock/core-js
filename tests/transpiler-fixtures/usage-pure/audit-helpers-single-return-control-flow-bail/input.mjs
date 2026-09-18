// Mixed returns and unsupported try/loop bodies keep the original receiver. Prototype reads
// dispatch independently and do not expose the returned constructors' static namespaces.
const a = (() => { if (cond) return Array; return Set; })().prototype.includes;
const b = (() => { try { return Map; } catch { return WeakMap; } })().prototype.findLast;
const c = (() => { for (const x of items) return x; })().prototype.toReversed;
export { a, b, c };
