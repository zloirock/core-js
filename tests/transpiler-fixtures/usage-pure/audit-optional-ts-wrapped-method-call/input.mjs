// TS-wrapped object expression in optional call: `((obj as any)?.at)?.(0)`. tests
// `normalizeOptionalChain`'s walk past TS wrappers between the replaced inner member
// and the outer optional. distinct second method on the next line for observable dispatch
const a = ((obj as any)?.at)?.(0);
const b = ((obj as any)?.flat)?.();
