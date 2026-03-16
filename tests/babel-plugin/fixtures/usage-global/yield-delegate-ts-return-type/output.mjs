import "core-js/modules/es.symbol.iterator";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.array.at";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
function* inner(): Generator<string, number[], void> {
  yield 'hello';
  return [42];
}
function* outer(): Generator<string, void, void> {
  const result = yield* inner();
  result.at(0);
}