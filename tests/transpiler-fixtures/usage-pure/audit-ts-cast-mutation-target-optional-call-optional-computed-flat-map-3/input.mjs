// Object.assign changes the enum key before the optional member read.
enum Assigned { MAP = 'map' }
Object.assign(Assigned, { MAP: 'filter' });
export const r9 = arr.flat?.()[Assigned.MAP](f);
