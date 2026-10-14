// A store of the realm in the sequence prefix of a realm-chain init: both legs run the effect and the store
// ahead of the extraction, babel lifting them into a statement of their own while unplugin's drain keeps the
// store in the extracted value (the sidecar).
let u;
const { fromEntries } = (e(), (u = globalThis).self).Object;
export { fromEntries };
