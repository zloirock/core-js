// channel: user-type instantiation with an explicit opaque type-arg
interface Box<T = number[]> { v: T; }
declare const defaultedBox: Box;
defaultedBox.v.at(0);
