// a `JSON.stringify` replacer runs with the holder as `this` and sees its methods, but a callback that
// reaches values only through the call's own work is an accepted boundary, so the narrow stays; a
// holder passed as a callback's explicit `thisArg` is handed out and loses it
export function viaReplacer(replacer) {
  const holder = { items: [1, 2], read() { return this.items.at(0); } };
  JSON.stringify(holder, replacer);
  return holder.read();
}
export function viaThisArg(list, map) {
  const holder = { items: [1, 2], read() { return this.items.includes(1); } };
  Array.from(list, map, holder);
  return holder.read();
}
