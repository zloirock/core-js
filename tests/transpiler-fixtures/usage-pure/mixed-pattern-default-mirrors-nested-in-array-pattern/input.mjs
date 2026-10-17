// the same mixed pattern one level down - inside an array or object pattern - is a level the mirror
// climbs through: the default is mirrored whole for the slot the call leaves empty, and no per-key
// fallback stands beside it (what the literal supplies is never undefined)
export const nestedInArrayPattern = (([{ Set: S3, Array: { of: of3 } } = globalThis]) => [S3, of3])([]);
