// ... and the enum whose SLOT the program rewrites: the declared value is no longer the runtime key,
// so the claim stands down whichever channel does the rewriting - a member write, or a call handed
// the container itself (the write index is keyed by assigned field and cannot see the second)
enum Patched {
  MAP = 'map'
}
(Patched as any).MAP = 'filter';