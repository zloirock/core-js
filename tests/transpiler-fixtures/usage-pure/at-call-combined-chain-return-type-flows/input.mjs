// the combined chain replaces the outer call with its own render, so the RETURN type it resolved
// has to travel to that replacement: a member above reads off it, and untyped there it resolves
// generic. `.name` off an array value then pulled the function-name ponyfill on the AST leg alone -
// one source, two import sets. the plain (non-optional) twin of each row never lost the type
const arr = [[1]];
export const namedAfterMap = arr.at?.(0).map(x => x).name;
export const namedAfterFlat = arr.at?.(0).flat().name;
export const namedAfterTwoHops = arr?.at?.(0).map(x => x)?.map(x => x).name;
// the plain twin: same value, no guard to travel through
export const namedPlain = arr.at(0).map(x => x).name;
// a genuinely unknown receiver still claims - the type is absent, not lost
const unknown = globalThis.unknownThing;
export const namedUnknown = unknown.map(x => x).name;
