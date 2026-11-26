// the other lexical hosts the recovery climbs: a plain block and a class static block
{
  let K;
  ({ Map: K } = globalThis);
  K = [5];
  K.at(0);
  globalThis.r8 = K.findLast(Boolean);
}
