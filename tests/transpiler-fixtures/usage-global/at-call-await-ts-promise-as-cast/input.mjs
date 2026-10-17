declare function getItems(): Promise<string[]>;
const p = getItems();
(await (p as Promise<string[]>)).at(-1);
