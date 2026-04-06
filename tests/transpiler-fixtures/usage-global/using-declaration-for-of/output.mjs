import "core-js/modules/es.symbol.dispose";
import "core-js/modules/es.symbol.iterator";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.error.is-error";
import "core-js/modules/es.suppressed-error.constructor";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.iterator.dispose";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
for (using resource of getResources()) {
  resource.use();
}