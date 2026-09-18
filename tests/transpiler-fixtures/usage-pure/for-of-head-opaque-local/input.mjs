// An iteration whose elements cannot be paired does not itself release their constructors.
// Unused heads, intrinsic properties and local aliases require no Map static namespace.
async function awaited() {
  for await (const value of [Map]) { const alias = value; void alias.name; }
}
function spread() { for (const value of [...[Map]]) void value.name; }
function sparse() { for (const value of [, Map]) void value; }
function named() { const values = [Map]; for (const value of values) {} }
