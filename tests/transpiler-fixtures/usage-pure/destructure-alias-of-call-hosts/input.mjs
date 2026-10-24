// Literal-container static/global leaves use the shared fallback; no wrapper synthesis is required.
// Binding identity, writes and later reads retain their existing inference and ordering.
const built = () => ({ a: Math });
const builtAlias = built();
const { a: { imul: viaAliasOfCall } } = builtAlias;
export const fromAliasOfCall = viaAliasOfCall(2, 3);
for (const { a: { log2: viaAliasOfCallHead } } of [builtAlias]) use(viaAliasOfCallHead(8));
function readAliasDefault({ a: { sign: viaAliasOfCallDefault } } = builtAlias) { return viaAliasOfCallDefault(-1); }
export const fromAliasOfCallDefault = readAliasDefault();
function readAliasArgument({ a: { trunc: viaAliasOfCallArgument } }) { return viaAliasOfCallArgument(1.5); }
export const fromAliasOfCallArgument = readAliasArgument(builtAlias);
const builtPair = () => [Array];
const pairAlias = builtPair();
const [{ of: viaAliasOfCallWrapped }] = pairAlias;
export const fromAliasOfCallWrapped = viaAliasOfCallWrapped(24);
