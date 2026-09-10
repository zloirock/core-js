import "core-js/modules/es.array.at";
import "core-js/modules/es.array.includes";
import "core-js/modules/es.string.at";
import "core-js/modules/es.string.includes";
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
    return v.at(0);
  }
}
export function viaConsequent(flag) {
  let w = 'abc';
  if (flag) {
    {
      w = [1, 2];
    }
    return w.includes(1);
  } else {
    throw 0;
  }
}