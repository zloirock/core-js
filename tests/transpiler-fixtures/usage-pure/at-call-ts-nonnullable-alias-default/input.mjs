type Nullable<T = number[]> = T | null;
function run(x: NonNullable<Nullable>) {
  x.at(0);
}
