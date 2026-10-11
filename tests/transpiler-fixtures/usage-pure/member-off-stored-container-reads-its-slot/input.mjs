// a static read off a slot of a container stored in the same expression reads that container, as its
// destructure twin does: the read is the slot's static, the store stays, through a `||` it decides too
var B;
export const grouped = (B = { C: Map }).C.groupBy;
export const settled = (B = [Promise])[0].allSettled;
export const integer = ((B = { C: Number }) || { C: Object }).C.isInteger;
