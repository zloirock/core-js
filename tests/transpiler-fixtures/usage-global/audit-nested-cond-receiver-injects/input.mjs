// usage-global only prepends side-effect imports (never rewrites the destructure), so a nested
// proxy leaf is flagged when EITHER ternary branch is a global proxy: a diverging
// `globalThis : userObj` receiver still injects the statics it MIGHT need (over-inject is safe).
// distinct keys (`from` / `stringify`) prove each drives its own import; bailing breaks ie:11.
const userObj = { Array: { from: () => [] }, JSON: { stringify: () => "" } };
const useGlobal = false;
const { Array: { from }, JSON: { stringify } } = useGlobal ? globalThis : userObj;
from([1]);
stringify({});
