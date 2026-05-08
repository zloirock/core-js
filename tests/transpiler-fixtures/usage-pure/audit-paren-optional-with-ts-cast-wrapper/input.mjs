// Paren + `as any` wraps the optional member; outer call may be optional or non-optional.
// Optional outer short-circuits cleanly; non-optional outer must throw on nullish via `.call`.
declare const arr: number[];
((arr?.at) as any)?.(0);
((arr?.includes) as any)(1);
