let F;
({ Map: F } = globalThis);
for (F of [globalThis.x]) {}
F.at(0);
export const r3 = F.flat();
