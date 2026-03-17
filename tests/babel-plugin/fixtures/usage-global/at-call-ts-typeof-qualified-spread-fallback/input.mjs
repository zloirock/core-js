const config: { items: string[] } = { ...defaults };
type Items = typeof config.items;
declare const x: Items;
x.at(0);
