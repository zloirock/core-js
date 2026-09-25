// a sole instance claim over a sequence init READS its receiver in its own dispatch, so the prefix
// rides inside that argument on either host - a binding, a getter, two prefixes, a nested sequence,
// a statement-position sequence, a declaration - and runs exactly once
const o = { get arr() { log(); return [1, 2]; } };
let at1;
({ at: at1 } = (eff(), arr));
let flat2;
({ flat: flat2 } = (eff(), o.arr));
let fm3;
({ flatMap: fm3 } = (eff(), eff(), arr));
let fl4;
({ findLast: fl4 } = (eff(), (eff(), arr)));
let inc5;
(0, ({ includes: inc5 } = (eff(), arr)));
const { toSorted: ts6 } = (eff(), arr);
use(at1, flat2, fm3, fl4, inc5, ts6);
