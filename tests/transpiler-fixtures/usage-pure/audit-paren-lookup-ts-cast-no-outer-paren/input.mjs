// optional member wrapped in inner parens then a TS cast, called non-optionally:
// chain ends at the optional access, outer call throws on nullish per native semantics
declare function getArr(): number[] | null;
((getArr()?.includes) as any)(1);
((getArr()?.at) as any)(0);
