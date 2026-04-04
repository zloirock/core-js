import "core-js/modules/es.symbol.iterator";
import "core-js/modules/es.array.at";
type MyGen = Generator<string, void, number[]>;
function* gen(): MyGen {
  const next = yield 'hello';
  next.at(0);
}