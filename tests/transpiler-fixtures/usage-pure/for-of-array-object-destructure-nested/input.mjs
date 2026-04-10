declare const entries: { key: string[] }[][];
for (const [{ key }] of entries) {
  key.at(-1);
}
