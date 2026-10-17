// A constant computed constructor key through a realm alias names the same receiver
// as a dotted global read, so its destructured instance slot gets the same helper.
const realm = globalThis;
export const value = (({ name }) => name)(realm['Symbol']);
