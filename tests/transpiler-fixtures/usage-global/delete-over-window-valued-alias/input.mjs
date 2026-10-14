// A `delete` through an alias holding the environment probe's value hides nothing from usage
// detection: the constructor each chain reads past the alias's realm hops pulls its family, behind
// the alias's optional link, past a missing static, past a paren seal and in the plain twin alike.
// The realm hops' own modules come with the alias's definition, so each row names a constructor.
const win = globalThis.window;
let late;
late = self.window;
export const viaSelfHop = delete win?.self.Map.slot;
export const viaRealmHop = delete late?.globalThis.Set.slot;
export const viaStatic = delete win?.self.WeakMap.noSuchStatic;
export const sealed = delete (win?.self.Promise).slot;
export const plainTwin = delete win.globalThis.WeakSet.slot;
