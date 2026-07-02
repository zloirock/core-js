type Inner<U> = [U, U];
type Outer<T> = Inner<T>;
declare const x: Outer<string>[0];
x.at(-1);
