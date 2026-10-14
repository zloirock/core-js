// a call of a class's static method returns what its one return names, as a literal method's call does:
// a static read off the result resolves through it in both emitters, the call kept for its effects
class Pick {
  static list() { return Array; }
}
const Measure = class {
  static math() { return Math; }
};
const Box = { list() { return Array; } };
export const list = Pick.list().from('ab');
export const cut = Measure.math().trunc(1.5);
export const single = Box.list().of(1);
