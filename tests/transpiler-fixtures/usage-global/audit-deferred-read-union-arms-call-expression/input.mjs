// A deferred reader resolves each reaching write in the write scope. Unshadowable nullish values add no receiver; an unknown value
// prevents narrowing to a known family.
let opaqueSlot = null;
const readSlot = () => opaqueSlot.at(0);
[opaqueSlot] = [source()];
export const a = readSlot();
