import '@core-js/types/annex-b/object-proto';
import '@core-js/types/annex-b/object-prototype-accessor-methods';

const object = {};
const proto: object | null = object.__proto__;
object.__defineGetter__('key', () => 1);
object.__defineSetter__('key', () => {});
const getter: (() => any) | undefined = object.__lookupGetter__('key');
const setter: ((val: any) => void) | undefined = object.__lookupSetter__('key');
