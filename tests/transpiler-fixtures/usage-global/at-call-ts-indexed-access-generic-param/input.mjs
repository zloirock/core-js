type Container<T> = { items: T[] };
type Items = Container<string>["items"];
declare const x: Items;
x.at(0);
x[0].includes("a");
