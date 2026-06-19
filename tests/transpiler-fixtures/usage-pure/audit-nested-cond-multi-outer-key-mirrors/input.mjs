// MULTIPLE outer proxy keys (`Array`, `JSON`): each mirrors its inner static into the synth
// literal independently, the user-object branch stays verbatim
const userObj = { Array: { from: () => "uf" }, JSON: { stringify: () => "us" } };
const { Array: { from }, JSON: { stringify } } = c ? globalThis : userObj;
from([1]);
stringify({});
