import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.filter";
import "core-js/modules/es.array.species";
import "core-js/modules/es.function.name";
import "core-js/modules/es.iterator.constructor";
import "core-js/modules/es.iterator.filter";
// A relocated catch default and a nested read keep their own bindings.
// The temporary default guard belongs to the joined extraction declaration.
try {
  throw getPlugin();
} catch ({
  name = 'anonymous',
  options: {
    filter
  }
}) {
  use(name, filter);
}