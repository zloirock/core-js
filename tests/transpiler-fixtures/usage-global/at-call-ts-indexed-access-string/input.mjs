interface Config {
  items: number[];
  name: string;
}
function foo(x: Config["name"]) {
  x.at(-1);
}
