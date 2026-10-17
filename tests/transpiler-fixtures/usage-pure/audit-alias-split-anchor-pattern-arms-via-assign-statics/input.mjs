// the assignment-form arm registers statics-only hints the same way; a MULTI-NAME anchor
// write registers each bound name independently (per-name entries, no clobber)
let AS1;
({ Object: AS1 } = globalThis);
export const viaAssignStatics = AS1.entries(pairsSrc);
