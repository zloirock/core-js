declare function getItems(): string[];
const items = getItems() satisfies string[];
const [a] = items;
a.at(0);
