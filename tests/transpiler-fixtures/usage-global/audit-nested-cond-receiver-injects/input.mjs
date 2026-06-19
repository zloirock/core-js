// usage-global never rewrites the destructure - it only prepends side-effect imports, so the
// conditional-receiver corruption class can't exist here. but the shared receiver detection flags a
// nested proxy leaf when EITHER ternary branch is a global proxy, so a diverging `globalThis : userObj`
// receiver still injects the statics it MIGHT need (over-inject is safe). distinct methods per key
// (`from` / `stringify`) prove each proxy key drives its own import; a detection regression that
// bailed on the diverging branch would silently drop these and break ie:11 at runtime
const userObj = { Array: { from: () => [] }, JSON: { stringify: () => "" } };
const useGlobal = false;
const { Array: { from }, JSON: { stringify } } = useGlobal ? globalThis : userObj;
from([1]);
stringify({});
