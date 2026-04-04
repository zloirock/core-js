import "core-js/modules/es.array.at";
class Base {
  get items(): string[] {
    return [];
  }
}
class Child extends (Base as typeof Base) {}
new Child().items.at(-1);