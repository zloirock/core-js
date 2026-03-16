import "core-js/modules/es.symbol.iterator";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.array.at";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
type Inner = Generator<string, number[], void>;
declare const gen: Inner;
function* outer(): Generator<string, void, void> {
  const result = yield* gen;
  result.at(0);
}