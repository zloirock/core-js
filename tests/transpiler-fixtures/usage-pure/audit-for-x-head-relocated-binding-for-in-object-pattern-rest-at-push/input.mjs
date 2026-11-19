const seen = [];
for (const { at, ...rest } in { a: 1 }) {
  seen.push(typeof at, 'at' in rest);
}
export { seen };
