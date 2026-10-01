// recursive arrow `const f = () => f();` - inline-call resolution must bail when the
// same binding name is re-entered, else it loops indefinitely walking f -> f -> f.
// secondary case: mutual recursion `g <-> h` exercises the same cycle guard.
const f = () => f();
const result1 = f().includes(1);
const g = () => h();
const h = () => g();
const result2 = g().includes(2);
export { result1, result2 };
