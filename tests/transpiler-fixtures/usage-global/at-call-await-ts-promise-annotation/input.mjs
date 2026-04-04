declare function getItems(): Promise<string[]>;
const p: Promise<string[]> = getItems();
(await p).at(-1);
