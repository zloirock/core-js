type Box<T> = { value: T };
declare const b: Box<string>;
b.value.at(0);
