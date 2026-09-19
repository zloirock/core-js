// an indirect-require entry at the head of the file keeps its prefix, and that prefix needs a memo
// ref: the `var _ref;` block anchors after the trailing user import OF THE BODY AS REWRITTEN - the
// kept prefix is a plain statement now, not an import-like one the refs should land behind, so the
// declaration prints above its first write like the AST emitter's
([1].at(0), require)("core-js/modules/es.array.includes");
export const r = 1;
