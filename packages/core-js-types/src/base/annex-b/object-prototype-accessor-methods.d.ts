interface Object {
  __defineGetter__(prop: PropertyKey, getter: () => any): void;

  __defineSetter__(prop: PropertyKey, setter: (val: any) => void): void;

  __lookupGetter__(prop: PropertyKey): (() => any) | undefined;

  __lookupSetter__(prop: PropertyKey): ((val: any) => void) | undefined;
}
