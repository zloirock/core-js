// Re-entering a rendered navigation keeps the terminal environment probe in its value.
// The source window optional guards the run, and the later window read stays before
// both the one-member and the two-member custom-property continuations.
export const twoMembersBelow = globalThis.window?.self.window.userSlot.deeper;
export const oneMemberBelow = globalThis.window?.self.window.userSlot;
