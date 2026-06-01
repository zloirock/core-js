// indexed access on a parenthesised inline object type (`({ items: number[] })['items']`):
// the paren wrapper passes through structural member lookup so the array value type
// resolves and the array-specific at variant is selected
declare const x: ({ items: number[] })['items'];
const r = x.at(0);
export { r };
