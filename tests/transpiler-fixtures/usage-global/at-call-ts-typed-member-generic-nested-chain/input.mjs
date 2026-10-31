type Box<T> = { items: T };
type Outer = { box: Box<string[]> };

declare const o: Outer;

o.box.items.at(-1);
