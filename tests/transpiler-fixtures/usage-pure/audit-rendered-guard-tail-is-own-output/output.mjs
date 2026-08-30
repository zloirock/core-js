import _globalThis from "@core-js/pure/actual/global-this";
import _self from "@core-js/pure/actual/self";
// the alternate a nav-collapse render emits is OWN OUTPUT: it is re-entered, and what the re-entry
// finds must be what the plan chose. the realm hop the source wrote above the collapse is not part
// of that alternate - it folds onto the ponyfill leaf, here and in the single-member twin beside it
export const twoMembersBelow = null == _globalThis.window ? void 0 : _self.userSlot.deeper;
export const oneMemberBelow = null == _globalThis.window ? void 0 : _self.userSlot;