// User sloppy-mode code assigns `_ref` inside a declarator init. A declarator init is never
// a plugin emit position, so the name is RESERVED for the user (not adopted as a leftover
// memo ref): plugin temporaries allocate `_ref2` and the user's write keeps its own slot.
const x = (_ref = compute());
export const r = [1, 2].at(0);
