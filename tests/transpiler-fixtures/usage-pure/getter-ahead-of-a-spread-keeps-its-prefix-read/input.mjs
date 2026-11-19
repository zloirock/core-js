// a sequence prefix reading a literal's getter keeps the read when a spread or an unknown key follows the
// getter: what follows may not spell the key, so the getter may still run. a data property or a lone
// setter before the spread runs nothing on the read, and leaves
const viaSpread = { get value() { log(); return 0; }, ...extra };
export const { prototype: { at } } = (viaSpread.value, String);
const viaKey = { get value() { log(); return 0; }, [key]: 1 };
export const { prototype: { includes } } = (viaKey.value, Array);
const data = { value: 0, ...extra };
export const { prototype: { padEnd } } = (data.value, String);
const quiet = { set mode(v) { log(v); }, ...extra };
export const { prototype: { trimEnd } } = (quiet.mode, String);
