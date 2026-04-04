interface Box<T = string> {
  items: T[];
}
const b: Box = {} as any;
b.items.at(-1).includes('x');
