const late = { C: Map };
const { C: L } = late;
late.C = null;
export const merged = (L || Object).assign;
