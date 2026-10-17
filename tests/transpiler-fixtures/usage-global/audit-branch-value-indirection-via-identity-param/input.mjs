// an identity-param callee flows its branching ARGUMENT to the return - the shared callee
// inliner resolves it like the zero-arg forms
const identity = x => x;
export const viaIdentityParam = identity(globalThis.cond ? Array : Iterator).of;
