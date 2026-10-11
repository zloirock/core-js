// a super-class alias written on a path the class definition may take - a conditional, a closure
// that ran, a try block - can be either constructor when `extends` captures it: usage-global unions
// the written constructors' statics beside the live init, exactly as a member read off such an alias
// does. usage-pure substitutes only a provable base and keeps every one of these native, so the
// constructor such a base may hold takes its whole entry (`Promise` and `Map` here)

let viaBranch = Object;
if (c) viaBranch = Array;
class Branch extends viaBranch {
  static go() { return super.from('ab'); }
}
export const conditionalWrite = Branch.go();

let viaClosure = Object;
const set = () => { viaClosure = Promise; };
set();
class Closure extends viaClosure {
  static go() { return super.allSettled([]); }
}
export const closureWrite = Closure.go();

let viaTry = Object;
try { viaTry = Map; } catch (e) { void e; }
class Try extends viaTry {
  static go() { return super.groupBy([], () => 1); }
}
export const tryWrite = Try.go();
