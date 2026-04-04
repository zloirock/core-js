type MaybeItems = number[] | null;
function foo(x: NonNullable<MaybeItems>) {
  x.at(-1);
}
