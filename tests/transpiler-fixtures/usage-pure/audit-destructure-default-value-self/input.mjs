// proxy-global alias via `self` (not `globalThis`). `resolveObjectName` treats both as
// proxy-globals; the alias registration path must cover every receiver in
// `POSSIBLE_GLOBAL_OBJECTS`, not just `globalThis`
const { Symbol: S = null } = self;
S.iterator in obj;
