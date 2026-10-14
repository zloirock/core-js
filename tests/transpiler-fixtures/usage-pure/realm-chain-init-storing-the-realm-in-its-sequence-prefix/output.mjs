import _globalThis from "@core-js/pure/actual/global-this";
import _Object$fromEntries from "@core-js/pure/actual/object/from-entries";
// A store of the realm in the sequence prefix of a realm-chain init: both legs run the effect and the store
// ahead of the extraction, babel lifting them into a statement of their own while unplugin's drain keeps the
// store in the extracted value (the sidecar).
let u;
e(), u = _globalThis;
const fromEntries = _Object$fromEntries;
export { fromEntries };