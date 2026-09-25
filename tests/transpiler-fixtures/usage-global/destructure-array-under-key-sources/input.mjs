// the level under the key may come from a CALL yielding the container - under a declarator, a for-of
// head and a parameter default - from a slot the callee fills from a parameter, from a nested array
// level, or from a container wrapped in an outer array. one static per row
const build = () => ({ k: [Object] });
const { k: [{ entries: viaCall }] } = build();
use(viaCall({}));
for (const { k: [{ values: viaCallHead }] } of [build()]) use(viaCallHead({}));
function viaCallDefault({ k: [{ fromEntries }] } = build()) { return fromEntries([]); }
use(viaCallDefault());
const wrap = value => ({ k: [1, value] });
const { k: [, { hasOwn: viaArgument }] } = wrap(Object);
use(viaArgument({}, 'k'));
const deep = { k: [[Object]] };
const { k: [[{ assign: viaDeep }]] } = deep;
use(viaDeep({}, {}));
const wrapped = [{ k: [Object] }];
const [{ k: [{ is: viaWrapped }] }] = wrapped;
use(viaWrapped(1, 1));
