// The short-circuited delete returns true without executing the computed constructor key.
export const removed = delete globalThis.window?.[(key(), "Map")].missing;
