async function f(p: Promise<string>) {
  (await p.finally(() => {})).at(0).trimEnd();
}
