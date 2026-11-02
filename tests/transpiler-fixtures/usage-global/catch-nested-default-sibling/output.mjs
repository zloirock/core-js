import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.at";
import "core-js/modules/es.array.includes";
import "core-js/modules/es.function.name";
import "core-js/modules/es.iterator.constructor";
import "core-js/modules/es.iterator.includes";
import "core-js/modules/es.string.at";
import "core-js/modules/es.string.includes";
// A nested default keeps its guard local to the relocated catch body.
// A sibling extraction must not discard that guard declaration.
try {
  throw getPlugin();
} catch ({
  at: {
    name
  } = {
    name: 'fallback'
  },
  meta: {
    includes
  }
}) {
  use(name, includes);
}