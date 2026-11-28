// The instantiated method returns an array.
type Bag<T> = {
  push(x: T): T[];
};
declare const b: Bag<number>;
const r = b.push(1);
r.at(0);
