// Capturing a selection keeps its static beside an intrinsic read and preserves the RHS identity.
let name, groupBy;
const value = ({ name, groupBy } = globalThis.zz || Map);
export const result = [name, typeof groupBy, value === Map];
