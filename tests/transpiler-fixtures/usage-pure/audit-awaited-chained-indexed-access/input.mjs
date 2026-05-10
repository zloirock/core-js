// chained indexed access inside Awaited: `Awaited<T['outer']['inner']>`; member resolution
// walks through both index hops к Promise inner
interface Box {
  items: Promise<number[]>;
}
interface Outer {
  box: Box;
}
type Inner = Awaited<Outer['box']['items']>;
declare const x: Inner;
x.includes(1);
x.at(0);
