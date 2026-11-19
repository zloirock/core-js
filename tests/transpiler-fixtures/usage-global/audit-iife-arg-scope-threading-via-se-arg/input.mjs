// an SE-wrapped arg peels for classification while the effect stays in place
export const viaSeArg = !function ({ entries }, Object) { return entries; } ((eff(), Object));
