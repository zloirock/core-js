// `keyof T` mapped expansion lock with NON-passthrough body so dispatch reaches
// expandMappedTypeMembers (passthrough mapped types short-circuit via unwrapMappedTypePassthrough,
// bypassing the expansion walker entirely). before the fix, encountering `#internal`
// returned null - bailing the whole expansion. after the fix, `#priv` keys are skipped
// per TS spec (`keyof T` excludes private) and public keys still expand
class Box {
  items: number[] = [1, 2, 3];
  #internal: string = 'hidden';
}

type Wrapped<T> = { [K in keyof T]: { value: T[K] } };
declare const b: Wrapped<Box>;
const arr = b.items.value;
const head = arr.at(0);
export { head };
