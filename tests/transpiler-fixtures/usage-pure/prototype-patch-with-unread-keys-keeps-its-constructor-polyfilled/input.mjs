// a patch of a built-in prototype under keys no canon reads leaves its members unknown, not its constructor:
// the construction ahead of the patch takes the pure constructor (an old engine's own lacks its fixes), and
// the patch lands on that constructor's prototype, so the instances made before it carry the members too
export const counts = new Map([[1, 2]]);
for (const name of Object.keys(extensions)) Object.defineProperty(Map.prototype, name, { value: extensions[name] });
export const total = () => counts.total();
export const seen = new Set([1]);
Object.assign(Set.prototype, makeExtensions());
export const sum = () => seen.sum();
