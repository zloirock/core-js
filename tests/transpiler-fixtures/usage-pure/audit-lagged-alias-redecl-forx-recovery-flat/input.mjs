let F;
({ Map: F } = globalThis);
for (F of [globalThis.x]) {}
export const r3 = F.flat();
