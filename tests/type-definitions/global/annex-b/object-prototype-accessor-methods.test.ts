import 'core-js/full';

declare const obj: Object;
obj.__defineGetter__('num', () => 42);
obj.__defineSetter__('num', (val: number) => {});
const getter: (() => any) | undefined = obj.__lookupGetter__('num');
const setter: ((val: number) => any) | undefined = obj.__lookupSetter__('num');
