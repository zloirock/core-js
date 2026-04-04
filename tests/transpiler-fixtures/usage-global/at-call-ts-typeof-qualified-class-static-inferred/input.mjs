class Config {
  static items = [1, 2, 3];
}
function foo(x: typeof Config.items) {
  x.at(-1);
}
