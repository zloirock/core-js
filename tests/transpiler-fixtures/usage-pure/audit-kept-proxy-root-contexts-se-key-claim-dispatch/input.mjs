// the remaining syntactic contexts, each reaching the migration through its own visitor
let c = 0;
// SE-keyed hop under a claimed static + instance dispatch: the dispatch's guard memoizes the
// probe root only, so the hop-key SE rides the claim body on the non-null branch
export const seKeyClaimDispatch = globalThis.window?.[(c++, 'self')].Array.of(8).flat();
