import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.find";
import "core-js/modules/es.array.includes";
import "core-js/modules/es.iterator.constructor";
import "core-js/modules/es.iterator.find";
// `this` inside an instance member answers for the receiver only while no own-this method of the
// hierarchy can be handed out. a method extracted off the PROTOTYPE runs the same body against a
// foreign receiver, so every polyfill that receiver might need has to stay injected - the lexical
// class is no longer proof of anything. each row is read by a method that can tell its verdict from
// the opposite one: a typed receiver pulls ONE family where an unknown one pulls every family the
// member could belong to, and the last row proves its receiver by injecting nothing at all - so the
// method it reads must be one no other row injects
class Local extends Array {
  read() {
    return this.includes(1);
  }
}
new Local().read();
class Borrowed {
  read() {
    return this.find(x => x);
  }
}
Borrowed.prototype.read.call([1, 2]);
const literal = {
  read() {
    return this.at(0);
  }
};
literal.read();