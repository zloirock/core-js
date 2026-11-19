// A write through an enum alias invalidates the declared computed key.
enum Aliased { MAP = 'map' }
const aliasOfEnum = Aliased;
Object.assign(aliasOfEnum, { MAP: 'filter' });
export const r10 = arr.flat?.()[Aliased.MAP](f);
