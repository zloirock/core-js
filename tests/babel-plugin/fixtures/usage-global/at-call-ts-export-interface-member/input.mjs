export interface Data {
  items: string[];
}

function foo(d: Data) {
  d.items.at(-1).replaceAll('x', 'y');
}
