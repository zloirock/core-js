import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.from";
import "core-js/modules/es.array.push";
import "core-js/modules/es.string.iterator";
// A decided fallback leaves only the live initializer effect in the loop header.
// The extracted static is always defined, so its default never runs.
const events = [];
let result;
for (var {
  from: read = (events.push('dead'), null)
} = (events.push('init'), Array) ?? Set; result === undefined;) {
  result = read([4, 6]);
}
export { result, events };