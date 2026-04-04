declare function getItems(): Promise<string[]>;
const p: Promise<string[]> = getItems();
const a = p;
(await a).at(-1);
