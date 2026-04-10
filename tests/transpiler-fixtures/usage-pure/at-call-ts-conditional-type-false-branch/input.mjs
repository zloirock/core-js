type Box<T> = { get(): T extends number ? never : T };
declare const b: Box<string>;
b.get().at(-1);
