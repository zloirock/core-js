type Box<T> = { get(): T; size(): number };
declare const box: Box<string[]>;
box.get().at(-1);
