interface Box<T> {
  items: T[];
}
const b: Box<string> = {} as any;
b.items.at(-1).includes('x');
