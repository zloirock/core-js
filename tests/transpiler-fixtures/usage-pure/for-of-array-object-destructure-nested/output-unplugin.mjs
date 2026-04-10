import _at from "@core-js/pure/actual/instance/at";
declare const entries: { key: string[] }[][];
for (const [{ key }] of entries) {
  _at(key).call(key, -1);
}