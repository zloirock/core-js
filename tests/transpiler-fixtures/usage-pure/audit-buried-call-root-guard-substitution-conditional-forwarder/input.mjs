let maybeForwards;
if (globalThis.setTimeout) maybeForwards = () => ({ window: { Array } });
export const conditionalForwarder = maybeForwards?.()?.window?.Array.of(15);
