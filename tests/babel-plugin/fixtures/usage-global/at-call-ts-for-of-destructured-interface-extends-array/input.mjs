interface NamedItems extends Array<{ name: string }> {}
const items: NamedItems = [];
for (const { name } of items) {
  name.at(0);
}
