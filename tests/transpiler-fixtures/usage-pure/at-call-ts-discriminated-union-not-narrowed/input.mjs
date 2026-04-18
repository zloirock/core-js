type Foo = { kind: "a"; data: string[] } | { kind: "b"; data: number };
function f(x: Foo) {
  if (x.kind === "a") {
    x.data.at(0);
  }
}
