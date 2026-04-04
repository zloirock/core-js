import "core-js/modules/es.array.at";
class Service {
  static create(): string[] {
    return [];
  }
}
function foo(x: ReturnType<typeof Service.create>) {
  x.at(-1);
}