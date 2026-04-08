declare const data: { user: { items: number[] } };
const { user: { items: list } } = data;
list.at(-1);
