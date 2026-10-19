import "core-js/modules/es.string.at";
import "core-js/modules/es.string.includes";
// a construction instantiates its class as a call instantiates a function: with the type arguments
// it spells, else with what its arguments infer, and only then with the defaults
class Box<T extends string | string[] = string[]> {
  v: T;
  constructor(v: T) {
    this.v = v;
  }
}
new Box<string>('xy').v.at(-1);
new Box('xy').v.includes('a');