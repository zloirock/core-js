// The assignment replaces the enum member before the optional call reads it.
// The flattened array calls filter with the original callback.
enum Patched { MAP = 'map' }
(Patched as any).MAP = 'filter';
export const r8 = arr.flat?.()[Patched.MAP](f);
