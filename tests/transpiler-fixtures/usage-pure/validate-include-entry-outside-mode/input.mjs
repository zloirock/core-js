// an included entry is imported from the configured layer, so it must exist there: `iterator/range`
// is a proposal only the `full` layer ships, and at the default `actual` the include would make
// the emitter import a file the package does not have. validation refuses it and names the mode
export const r = Iterator.range(0, 3);
