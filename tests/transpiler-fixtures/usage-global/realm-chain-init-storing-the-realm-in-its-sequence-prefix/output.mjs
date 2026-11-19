import "core-js/modules/es.object.from-entries";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.global-this";
import "core-js/modules/web.self";
// A store of the realm in the sequence prefix of a realm-chain init hides nothing: the static read past the
// hops loads its module beside both realm roots'.
let u;
const {
  fromEntries
} = (e(), (u = globalThis).self).Object;
export { fromEntries };