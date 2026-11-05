// Fresh-object truthiness decides the first live container of a logical chain.
// Nested destructuring keeps a native static read; a direct member static remains served.
export const { C: { groupBy } } = { C: Map } || { C: Object } || { C: Set };
export const settled = ({ C: Promise } || { C: Array } || { C: Number }).C.allSettled;
