import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.includes";
import "core-js/modules/es.iterator.constructor";
import "core-js/modules/es.iterator.includes";
import "core-js/modules/es.string.includes";
const inherited = {
  seq: 'st',
  find2() {
    return this.seq.includes('s');
  }
};
const heir = {};
Object.setPrototypeOf(heir, inherited);