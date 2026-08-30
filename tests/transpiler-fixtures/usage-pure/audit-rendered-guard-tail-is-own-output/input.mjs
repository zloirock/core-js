// the alternate a nav-collapse render emits is OWN OUTPUT: it is re-entered, and what the re-entry
// finds must be what the plan chose. the realm hop the source wrote above the collapse is not part
// of that alternate - it folds onto the ponyfill leaf, here and in the single-member twin beside it
export const twoMembersBelow = globalThis.window?.self.window.userSlot.deeper;
export const oneMemberBelow = globalThis.window?.self.window.userSlot;
