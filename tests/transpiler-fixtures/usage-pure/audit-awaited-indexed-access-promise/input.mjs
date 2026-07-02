// `Awaited<T['key']>` where the indexed property is a Promise wrapper; member dispatch
// must resolve through the indexed-access AST to the underlying Promise inner type
interface Bag {
  items: Promise<number[]>;
  log: Promise<string>;
}
type T = Awaited<Bag['items']>;
declare const x: T;
x.includes(1);
x.at(0);
