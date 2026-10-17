const aliased = { O: Object, A: Array };
let aliasBind, aliasFrom;
({ O: { keys: { bind: aliasBind } }, A: { from: aliasFrom } } = aliased);
export const unnamed = [typeof aliasBind, typeof aliasFrom];
