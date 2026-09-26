// An imported key is not proven safe to mirror. The declaration retains its key read
// and guards the named static against the selected constructor.
import X from "x";
const cond = Math.random() > 0.5;
const { [X]: it, from } = cond ? Array : Set;
[from([1]), it];
