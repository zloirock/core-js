interface Container<T, U = T[]> { items: U }
declare const c: Container<number>;
c.items.at(-1);
