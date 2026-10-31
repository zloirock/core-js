import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.includes";
import "core-js/modules/es.iterator.constructor";
import "core-js/modules/es.iterator.includes";
import "core-js/modules/es.string.includes";
const storedWritten = {};
storedWritten.f = {
  codes: 'kw',
  check() {
    return this.codes.includes('k');
  }
};
storedWritten.f.codes = 5;
storedWritten.f.check();