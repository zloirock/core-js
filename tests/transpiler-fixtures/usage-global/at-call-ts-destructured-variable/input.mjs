declare function getData(): { items: number[] };
const { items }: { items: number[] } = getData();
items.at(-1);
