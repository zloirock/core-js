// An unbound name can read a global accessor. Capture it before the optional null test.
export const value = rows?.at?.(0);
export const method = rows?.at;
export const sealed = (rows?.at)(0);
