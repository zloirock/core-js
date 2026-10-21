import _Math$imul from "@core-js/pure/actual/math/imul";
import _Math$log2 from "@core-js/pure/actual/math/log2";
import _Math$sign from "@core-js/pure/actual/math/sign";
import _Math$trunc from "@core-js/pure/actual/math/trunc";
// Literal-container static/global leaves use the shared fallback; no wrapper synthesis is required.
// Binding identity, writes and later reads retain their existing inference and ordering.
const built = () => ({
  a: Math
});
const builtAlias = built();
const {
  a: {
    imul: viaAliasOfCall
  }
} = {
  a: {
    imul: _Math$imul
  }
};
export const fromAliasOfCall = viaAliasOfCall(2, 3);
for (const {
  a: {
    log2: viaAliasOfCallHead
  }
} of [{
  a: {
    log2: _Math$log2
  }
}]) use(viaAliasOfCallHead(8));
function readAliasDefault({
  a: {
    sign: viaAliasOfCallDefault
  }
} = {
  a: {
    sign: _Math$sign
  }
}) {
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
export const fromAliasOfCallArgument = readAliasArgument({
  a: {
    trunc: _Math$trunc
  }
});
const builtPair = () => [Array];
const pairAlias = builtPair();
const [{
  of: viaAliasOfCallWrapped
}] = pairAlias;
export const fromAliasOfCallWrapped = viaAliasOfCallWrapped(24);