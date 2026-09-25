import "core-js/modules/es.symbol.constructor";
import "core-js/modules/es.symbol.description";
import "core-js/modules/es.symbol.iterator";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.math.log2";
import "core-js/modules/es.array.from";
import "core-js/modules/es.array.of";
import "core-js/modules/es.math.imul";
import "core-js/modules/es.math.sign";
import "core-js/modules/es.math.trunc";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
// a NAME bound to a call pairs as the call does under every host: the mirror reads the name as the
// container the call yields and the wrapper walks follow the binding to it - a declarator, a for-of
// head, a parameter default and an argument, an array wrapper. one static per row
const built = () => ({
  a: Math
});
const builtAlias = built();
const {
  a: {
    imul: viaAliasOfCall
  }
} = builtAlias;
export const fromAliasOfCall = viaAliasOfCall(2, 3);
for (const {
  a: {
    log2: viaAliasOfCallHead
  }
} of [builtAlias]) use(viaAliasOfCallHead(8));
function readAliasDefault({
  a: {
    sign: viaAliasOfCallDefault
  }
} = builtAlias) {
  return viaAliasOfCallDefault(-1);
}
export const fromAliasOfCallDefault = readAliasDefault();
function readAliasArgument({
  a: {
    trunc: viaAliasOfCallArgument
  }
}) {
  return viaAliasOfCallArgument(1.5);
}
export const fromAliasOfCallArgument = readAliasArgument(builtAlias);
const builtPair = () => [Array];
const pairAlias = builtPair();
const [{
  of: viaAliasOfCallWrapped
}] = pairAlias;
export const fromAliasOfCallWrapped = viaAliasOfCallWrapped(24);