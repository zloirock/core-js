{
const boundKey = 'w'; function boundKeyParam({ [boundKey]: { Map: v } } = { w: globalThis }) { return v; } use(boundKeyParam());
}
