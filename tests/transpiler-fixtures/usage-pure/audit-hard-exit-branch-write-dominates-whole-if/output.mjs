import _at from "@core-js/pure/actual/instance/at";
import _includes from "@core-js/pure/actual/instance/includes";
// a write the sibling branch's hard exit lets out of an `if` dominates only PAST the whole
// statement: inside it the other branch runs instead. the rule reads both branches, so each row
// keeps its receiver's declared string in the union and a narrow to the written array is the
// regression. the nested block puts the write outside the use's own statement list
export function viaAlternate(flag) {
  let v = 'abc';
  if (flag) {
    throw 0;
  } else {
    {
      v = [1, 2];
    }
    return _at(v).call(v, 0);
  }
}
export function viaConsequent(flag) {
  let w = 'abc';
  if (flag) {
    {
      w = [1, 2];
    }
    return _includes(w).call(w, 1);
  } else {
    throw 0;
  }
}