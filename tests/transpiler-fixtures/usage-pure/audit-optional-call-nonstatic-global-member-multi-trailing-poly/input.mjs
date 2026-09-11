// the same defect with TWO trailing polyfilled hops (routes through the multi-poly compose path,
// not the single-poly standalone path): a non-static member optional call must still preserve its
// guard so the whole chain short-circuits to undefined instead of calling a non-existent static
const r = Promise.noSuchStatic?.().flat().at(0);
r;
