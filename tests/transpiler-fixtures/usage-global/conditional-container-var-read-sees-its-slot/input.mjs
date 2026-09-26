// a read off a container `var` initialized in a BRANCH may see the container wherever the init can
// have run by the read - directly, loop-carried and through a closure; where the init sits in the
// opposite arm, or is declared after the read, the read can never see it. pure keeps the read behind
// an identity guard on the constructor the slot holds, so a skipped branch still throws natively
function g1() { if (on) { var box = { A: Array }; } return box.A.from; }
function g2() { let r; for (let i = 0; i < 2; i++) { if (i) r = box.P.try; else { var box = { P: Promise }; } } return r; }
function g3() { if (on) { var box = { I: Iterator }; } return () => box.I.concat; }
function g4() { if (!on) { var box = { O: Object }; } else { return box.O.fromEntries; } }
function g5() { const r = box.M.sumPrecise; var box = { M: Math }; return r; }
use(g1, g2, g3, g4, g5);
