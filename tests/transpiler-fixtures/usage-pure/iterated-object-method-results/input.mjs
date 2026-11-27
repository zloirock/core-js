const first = [];
for (const obj of [{ read() { return [7]; } }, { read() { return 'word'; } }]) {
  first.push(obj.read().at(0));
}
export { first };
