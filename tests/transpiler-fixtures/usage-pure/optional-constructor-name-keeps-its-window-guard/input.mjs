// The constructor exists only on the live branch of the environment probe.
export const name = globalThis.window?.Map?.name ?? missing();
export const known = globalThis?.Map?.name;
