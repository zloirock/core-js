class Config {
  static items = ['a', 'b'];
}
function foo(x: typeof Config.items) {
  x.at(-1);
}
