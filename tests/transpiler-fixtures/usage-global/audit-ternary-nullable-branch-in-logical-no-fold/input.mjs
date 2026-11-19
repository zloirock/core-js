// the nullable-branch ternary fold drops a statically null arm; sound for the bare receiver
// but not for an enclosing logical: `(c ? nums : null)` may still be null, so `??` may yield
// the string fallback - usage-global injects the union (es.array.at + es.string.at)
declare const c: boolean;
declare const nums: number[];
((c ? nums : null) ?? 'x').at(0);
