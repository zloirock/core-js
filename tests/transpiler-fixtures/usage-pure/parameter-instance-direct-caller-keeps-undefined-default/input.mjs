// A direct IIFE argument that yields undefined activates the Array prototype default.
function source() { return undefined; }
export const result = (({ at } = Array.prototype) => at.call([4], 0))(source());
