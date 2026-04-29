// a single chain mixes `?.(`, `?.[`, and `?.prop`; verifies each optional shape is rewritten
// in place without losing the `.` between hops.
obj?.(key)?.[idx]?.at(0);
