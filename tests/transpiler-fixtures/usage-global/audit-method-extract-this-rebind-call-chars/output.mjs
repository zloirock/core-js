import "core-js/modules/es.array.at";
import "core-js/modules/es.string.at";
class Inst {
  chars = ['c'];
  look() {
    return this.chars.at(2);
  }
}
const inst = new Inst();
const m2 = inst.look;
m2.call({
  chars: 7
});