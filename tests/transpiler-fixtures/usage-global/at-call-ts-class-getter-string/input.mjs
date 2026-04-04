class Foo {
  get bar(): string { return ''; }
}
new Foo().bar.at(-1);
