// a dynamic computed-key member as a rest-element destructuring target (`[...c[k]] = a`) writes an
// unenumerable field. the field narrow must bail and `.at` widens to the generic instance helper
class C {
  box = [1, 2, 3];
  first() {
    return this.box.at(0);
  }
}
declare const k: string;
const c = new C();
[...c[k]] = [1, 2];
c.first();
