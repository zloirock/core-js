type Inner<T = number> = T[];
type Outer<U = Inner> = U;
const x: Outer = [1, 2];
x.at(0);
