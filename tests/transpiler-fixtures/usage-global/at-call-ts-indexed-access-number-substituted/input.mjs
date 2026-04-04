type Elem<T extends any[]> = T[number];

function foo(x: Elem<string[]>) {
  x.at(0);
}
