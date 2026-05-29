import "core-js/modules/es.array.at";
import "core-js/modules/es.string.at";
// the external write lives inside an arrow (a deferred callback), not straight-line code - its
// source position cannot bound when it runs, so the items narrow folds it and .at stays generic
class C {
  items = [1, 2, 3];
  read() {
    return this.items.at(0);
  }
}
const c = new C();
const corrupt = () => {
  c.items = "s";
};
corrupt();
c.read();