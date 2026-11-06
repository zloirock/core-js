import "core-js/modules/es.array.at";
import "core-js/modules/es.string.includes";
// a class instantiated with a type argument the resolver CAN type keeps the precision of its
// type-param-returning method - the declared return answers, not the body's stub - and an omitted
// argument falls back to the parameter's default
class Holder<T = string> {
  get(): T {
    return null as any;
  }
}
declare const resolved: Holder<number[]>;
resolved.get().at(0);
declare const defaulted: Holder;
defaulted.get().includes('d');