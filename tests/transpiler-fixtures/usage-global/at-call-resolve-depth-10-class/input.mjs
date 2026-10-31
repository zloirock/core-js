class Foo {
  items: number[] = [];
}
const C1 = Foo;
const C2 = C1;
const C3 = C2;
const C4 = C3;
const C5 = C4;
const C6 = C5;
const C7 = C6;
const C8 = C7;
const C9 = C8;
const C10 = C9;
new C10().items.at(-1);
