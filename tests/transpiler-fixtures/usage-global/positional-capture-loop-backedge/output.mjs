import "core-js/modules/es.symbol.constructor";
import "core-js/modules/es.symbol.description";
import "core-js/modules/es.symbol.iterator";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.array.at";
import "core-js/modules/es.array.from";
import "core-js/modules/es.array.includes";
import "core-js/modules/es.string.at";
import "core-js/modules/es.string.includes";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
// Each iteration captures its current element before the name is rebound.
// A later iteration may hold another receiver family, so instance dispatch remains wide.
let value = [0, 2];
for (let i = 0; i < 2; i++) {
  const [saved] = [value];
  use(saved.at(-1), saved.includes('02'));
  value = '02';
}