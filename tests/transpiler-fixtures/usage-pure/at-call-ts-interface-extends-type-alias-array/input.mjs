type W<T> = { items: T[] };
interface I extends W<string> {}
declare const i: I;
i.items.at(-1);
