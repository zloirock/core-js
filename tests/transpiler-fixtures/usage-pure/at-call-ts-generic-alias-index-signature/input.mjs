type Dict<T> = { [k: string]: T };
declare const d: Dict<number[]>;
d.foo.at(0);
