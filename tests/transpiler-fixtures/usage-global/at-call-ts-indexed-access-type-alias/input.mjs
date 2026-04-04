type Config = {
  items: number[];
  name: string;
};
function foo(x: Config["items"]) {
  x.at(-1);
}
