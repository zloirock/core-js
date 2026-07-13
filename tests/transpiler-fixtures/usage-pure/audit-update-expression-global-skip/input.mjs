// increment/decrement operand is preserved verbatim - polyfilled identifier in `++`/`--`
// position stays as written so the emit remains a valid update target. same for the
// operand behind TS wrappers. unrelated `let x = Map` initializer outside any update
// context is DEOPTED - the updates mark the slots mutated, so every read of those names
// stays verbatim on the live binding
let x = Map;
x++;
(Map as unknown)!++;
--Promise;
Set!--;
