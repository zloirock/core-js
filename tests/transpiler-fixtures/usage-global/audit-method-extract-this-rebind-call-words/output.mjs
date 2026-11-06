import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.includes";
import "core-js/modules/es.iterator.constructor";
import "core-js/modules/es.iterator.includes";
import "core-js/modules/es.string.includes";
class Stat {
  static words = 'wv';
  static ask() {
    return this.words.includes('w');
  }
}
const m3 = Stat.ask;
m3.call({
  words: [3]
});