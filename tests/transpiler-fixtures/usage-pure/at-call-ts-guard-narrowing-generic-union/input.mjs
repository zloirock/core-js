type Box<T> = string | Array<T>;
function f(x: Box<number>) {
  if (typeof x !== 'string') x.at(-1);
}
