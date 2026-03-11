interface Data {
  name: string;
}

function foo(d: Data) {
  d.name.at(-1);
}
