const g = () => globalThis;
export const viaGuardedStaticField = g()?.window?.Number.MAX_SAFE_INTEGER.toFixed(2);
