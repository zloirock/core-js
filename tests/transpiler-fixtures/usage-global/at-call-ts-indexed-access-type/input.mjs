type Config = { items: string[] };
type Item = Config["items"];
declare const x: Item;
x.at(0);
