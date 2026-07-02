// TypeScript `private` modifier on a class field still uses PropertyDefinition with a
// typeAnnotation slot. visitor must walk that annotation regardless of accessibility
// modifier - the polyfill emission gate is independent of public / private / protected
class Store {
  private data: Map<string, number> = new Map();
  read(key: string) {
    return this.data.get(key);
  }
}
new Store();
