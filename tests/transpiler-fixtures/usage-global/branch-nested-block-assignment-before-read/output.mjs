import "core-js/modules/es.array.at";
import "core-js/modules/es.array.includes";
// A nested plain block runs before the following read in its own if branch.
// Each read therefore observes the array written in that block; the sibling branch exits.
// Braces change the statement-list nesting without changing the reaching value.
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