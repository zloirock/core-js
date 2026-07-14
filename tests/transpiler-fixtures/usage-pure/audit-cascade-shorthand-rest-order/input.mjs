// the assignment-cascade order canon: a top-level aliased/shorthand binding prop's extraction
// precedes the surviving residual even beside a REST sibling (the rest-forced demotion clause
// diverged from the aliased control); nested-pattern props still follow the residual
({ Symbol, Array: { from }, ...rest } = globalThis);
export const viaShorthandRest = [from([1]), rest];

let al;
({ Iterator: al, ...others } = globalThis);
export const viaAliasedRest = [al.range(0, 3), others];
