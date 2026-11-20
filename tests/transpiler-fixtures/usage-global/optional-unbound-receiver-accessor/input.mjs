// Each optional read of an unbound receiver needs its own method family in usage-global.
export const value = rows?.at?.(0);
export const method = rows?.findLast;
export const sealed = (rows?.flat)(0);
