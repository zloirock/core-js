type Box<T> = { get(): T extends string ? T : never };
declare const b: Box<string>;
b.get().at(-1);
