// An unknown computed key keeps its source read native.
// Global usage loads the possible own statics; prototype methods need their own usage.
// A guarded claim at the pattern's edge may still detach ahead of it.
let M = pickConstructor();
if (!M) M = Array;
const { from, [runtimeKey]: method = fallback() } = M;
export { from, method };
