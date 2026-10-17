import "core-js/modules/es.object.from-entries";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.iterator";
let source;
{
  const Set = Object;
  source = Set;
}
export const destructured = () => {
  const {
    fromEntries
  } = source;
  return fromEntries([['a', 1]]);
};