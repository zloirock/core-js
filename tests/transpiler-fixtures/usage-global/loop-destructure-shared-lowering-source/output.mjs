import "core-js/modules/es.symbol.constructor";
import "core-js/modules/es.symbol.description";
import "core-js/modules/es.symbol.iterator";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.array.from";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
// A loop-local destructured value remains visible to a following member read.
// The full class/block lowering interaction has its own co-transform source.
class DocTypeReader {
  constructor(options) {
    for (; i < xmlData.length; i++) {
      let entityName, val;
      [entityName, val, i] = this.readEntityExp(xmlData, i + 1, this.suppressValidationErr);
      if (val.indexOf('&') === -1) entities[entityName] = {};
    }
  }
}