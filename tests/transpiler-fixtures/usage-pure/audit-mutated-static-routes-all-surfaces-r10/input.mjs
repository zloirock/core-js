// An array-wrapped destructure observes a later write to its selected static.
const [{ entries: entriesAlias }] = [Object];
Object.entries = entriesPatch;
export const r10 = entriesAlias;
