class Service {
  static create(): string[] {
    return [];
  }
}
function foo(x: ReturnType<typeof Service.create>) {
  x.at(-1);
}
