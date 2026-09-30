// A prototype method in a loop initializer follows every nested sequence prefix.
// The prefixes run once before the instance dispatch reads the prototype.
// Global mode keeps the source pattern and supplies its imports.
for (const { prototype: { at } } = (outer(), (inner(), Array)); flag;) {
  use(at);
}
