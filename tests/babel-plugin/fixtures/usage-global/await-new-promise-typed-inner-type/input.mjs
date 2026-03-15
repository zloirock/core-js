async function f() {
  (await new Promise<string>(r => r(''))).at(0).trimStart();
}
