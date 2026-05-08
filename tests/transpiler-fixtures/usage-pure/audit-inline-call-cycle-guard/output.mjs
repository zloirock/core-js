// cyclic alias chains must bail without infinite recursion. three shapes:
//   1) direct self-call: `f = () => f()` - receiver never resolves
//   2) two-step cycle: `g -> h -> g` - receiver never resolves
//   3) three-step cycle: `p -> q -> r -> p` - receiver never resolves
const f = () => f();
const r1 = f().resolve(1);
const g = () => h();
const h = () => g();
const r2 = g().reject(2);
const p = () => q();
const q = () => r();
const r = () => p();
const r3 = p().any([]);
export { r1, r2, r3 };