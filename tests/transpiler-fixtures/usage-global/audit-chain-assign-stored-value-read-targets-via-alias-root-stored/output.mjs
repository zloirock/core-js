import "<CWD>/packages/core-js/modules/es.global-this.js";
import "<CWD>/packages/core-js/modules/web.self.js";
// an ALIAS-rooted stored value collapses off the root's visit like the ident-rooted twin
const galias = globalThis;
let k11;
export const viaAliasRootStored = (k11 = galias.window.self)?.Object.isExtensible({});