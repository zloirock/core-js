class Config {
  static items: number[] = [];
}
function foo(x: typeof Config.items) {
  x.at(-1);
}
