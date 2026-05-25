class C {
  items = [1, 2, 3];
  getFirst() { return this.items.at(0); }
}

// declarator-bound instance - tracked in closure  
const a = new C();

// assignment-bound instance - currently isLeakPosition=true,
// bails ENTIRE closure (including a's narrow)
let b;
b = new C();

// no writes to b.items - if closure tracked correctly, a.getFirst() should narrow
a.getFirst();
