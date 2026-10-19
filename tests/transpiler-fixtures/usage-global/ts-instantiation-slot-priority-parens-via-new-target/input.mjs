function viaNewTarget() {
  // @ts-expect-error an instantiation over a value with no generic signature is the shape under test
  return ((new.target)<string>)(1);
}
