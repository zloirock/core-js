export async function read() {
  const item = Object.assign([17], { then(done) { done('xy'); } });
  for await (const value of [item].values()) return value.at(-1);
}
