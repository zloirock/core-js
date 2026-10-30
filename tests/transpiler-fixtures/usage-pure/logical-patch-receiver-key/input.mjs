// The key changes the variable after the write has already selected its receiver.
let rows = [];
const other = { at: () => "other" };
export const method = (rows[(rows = other, "at")] ??= fallback);
