import _globalThis from "@core-js/pure/actual/global-this";
import _self from "@core-js/pure/actual/self";
// Re-entering a rendered navigation keeps the terminal environment probe in its value.
// The source window optional guards the run, and the later window read stays before
// both the one-member and the two-member custom-property continuations.
export const twoMembersBelow = null == _globalThis.window ? void 0 : _self.window.userSlot.deeper;
export const oneMemberBelow = null == _globalThis.window ? void 0 : _self.window.userSlot;