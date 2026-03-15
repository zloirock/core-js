import "core-js/modules/es.symbol.iterator";
import "core-js/modules/es.string.repeat";
import "core-js/modules/es.string.pad-end";
import "core-js/modules/es.array.at";
function* gen(): Generator<string, void, string[]> {
  const items = yield 'ready';
  items.at(-1).padEnd(5);
}