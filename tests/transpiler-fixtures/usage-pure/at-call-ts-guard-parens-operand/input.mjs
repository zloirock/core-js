function f(x: unknown) {
  if ((x) instanceof Array) x.at(-1);
  if (Array.isArray((x))) x.at(-1);
}
