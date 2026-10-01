class Foo {
  constructor(@inject(Array.from('abc')) foo: string) {}
  method(@log(Object.fromEntries([])) arg: number) {}
}
