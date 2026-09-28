import "core-js/modules/es.object.entries";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.at";
import "core-js/modules/es.array.from";
import "core-js/modules/es.array.of";
import "core-js/modules/es.string.iterator";
// A default reading a claim the pattern binds is no ordering hazard where the claim is written first:
// a later sibling on a declaration, a closure that runs only after the pattern, a parameter of that
// closure shadowing the name. Every claim here extracts.
const {
  from,
  of = from
} = Array;
const {
  make = () => entries({}),
  entries
} = Object;
const {
  mapper = at => at,
  at
} = [1, 2];
export { from, of, make, entries, mapper, at };