declare function getItems(): string[];
const items = getItems() satisfies string[];
for (const item of items) {
  item.at(0);
}
