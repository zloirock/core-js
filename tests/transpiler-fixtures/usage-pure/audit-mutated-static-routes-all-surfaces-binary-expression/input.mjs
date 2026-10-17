// A static patch through a returned constructor is visible to an in-check.
function supplier() { return Object; }
const O = supplier();
O.groupBy = c3;
export const r4 = 'groupBy' in Object;
