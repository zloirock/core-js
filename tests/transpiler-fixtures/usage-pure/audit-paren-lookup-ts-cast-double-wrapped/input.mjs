// optional member wrapped in inner parens then a stack of TS casts, called
// non-optionally; throw-on-nullish semantics survive the wrapper stack
declare function getArr(): number[] | null;
((getArr()?.includes) as any as Function)(1);
((getArr()?.at) satisfies any as never)(0);
