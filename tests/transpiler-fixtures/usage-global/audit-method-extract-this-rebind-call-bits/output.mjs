import "core-js/modules/es.array.at";
import "core-js/modules/es.string.at";
class Proto {
  bits = [4];
  poke() {
    return this.bits.at(4);
  }
}
const m4 = Proto.prototype.poke;
m4.call({
  bits: 'bb'
});