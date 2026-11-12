import "core-js/modules/es.array.at";
// Method modifiers keep their TypeScript order before the bundler lowers the class.
declare class Base {
  protected static make(): void;
}
export abstract class Box extends Base {
  protected abstract read(): number;
  protected static override make() {
    [7].at(0);
  }
}