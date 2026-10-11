// increment/decrement operand is preserved verbatim - polyfilled identifier in `++`/`--`
// position stays as written so the emit remains a valid update target. same for the
// operand behind TS wrappers. the unrelated `let x = Map` initializer runs ahead of every
// update, so it still reads the slot this build serves and takes the pure import; a read
// after the updates would stay verbatim on the live binding
let x = Map;
x++;
(Map as unknown)!++;
--Promise;
Set!--;
