// mixed extraction + residual - the prefix runs exactly once (lift, not lift + replay)
const { Promise: { try: tryFn, customP } } = (eff(), globalThis);

export const r = [tryFn, customP];
