// where pure guards an open selection of the installer's owners, the guard absorbs the install call: a
// receiver typed before that render - a closure written above it - reads the install, one typed after it
// does not, whatever else the file reads. global, rewriting nothing, reads it for both; the installer and
// its owners load their own modules
const owners = {};
export const early = () => owners.findLast(f);
(c ? Object : Reflect).setPrototypeOf(owners, Array.prototype);
export const late = owners.at(-1);
