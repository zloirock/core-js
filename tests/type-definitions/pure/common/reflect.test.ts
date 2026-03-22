import $Reflect from '@core-js/pure/full/reflect';
import apply from '@core-js/pure/full/reflect/apply';
import construct from '@core-js/pure/full/reflect/construct';
import defineProperty from '@core-js/pure/full/reflect/define-property';
import deleteProperty from '@core-js/pure/full/reflect/delete-property';
import get from '@core-js/pure/full/reflect/get';
import getOwnPropertyDescriptor from '@core-js/pure/full/reflect/get-own-property-descriptor';
import getPrototypeOf from '@core-js/pure/full/reflect/get-prototype-of';
import has from '@core-js/pure/full/reflect/has';
import isExtensible from '@core-js/pure/full/reflect/is-extensible';
import ownKeys from '@core-js/pure/full/reflect/own-keys';
import preventExtensions from '@core-js/pure/full/reflect/prevent-extensions';
import set from '@core-js/pure/full/reflect/set';
import setPrototypeOf from '@core-js/pure/full/reflect/set-prototype-of';

function greet(this: { name: string }, greeting: string): string {
  return `${ greeting }, ${ this.name }`;
}

const r1: string = $Reflect.apply(greet, { name: 'world' }, ['hello']);
const r2: string = apply(greet, { name: 'world' }, ['hello']);

class Foo { constructor(public x: number) {} }
const r3: Foo = $Reflect.construct(Foo, [42]);
const r4: Foo = construct(Foo, [42]);

const r5: boolean = $Reflect.defineProperty({}, 'x', { value: 1 });
const r6: boolean = defineProperty({}, 'x', { value: 1 });

const r7: boolean = $Reflect.deleteProperty({ x: 1 }, 'x');
const r8: boolean = deleteProperty({ x: 1 }, 'x');

const obj = { a: 1, b: 'hello' };
const r9: number = $Reflect.get(obj, 'a');
const r10: number = get(obj, 'a');

const r11: TypedPropertyDescriptor<number> | undefined = $Reflect.getOwnPropertyDescriptor(obj, 'a');
const r12: TypedPropertyDescriptor<number> | undefined = getOwnPropertyDescriptor(obj, 'a');

const r13: object | null = $Reflect.getPrototypeOf(obj);
const r14: object | null = getPrototypeOf(obj);

const r15: boolean = $Reflect.has(obj, 'a');
const r16: boolean = has(obj, 'a');

const r17: boolean = $Reflect.isExtensible(obj);
const r18: boolean = isExtensible(obj);

const r19: (string | symbol)[] = $Reflect.ownKeys(obj);
const r20: (string | symbol)[] = ownKeys(obj);

const r21: boolean = $Reflect.preventExtensions({});
const r22: boolean = preventExtensions({});

const r23: boolean = $Reflect.set(obj, 'a', 2);
const r24: boolean = set(obj, 'a', 2);

const r25: boolean = $Reflect.setPrototypeOf({}, null);
const r26: boolean = setPrototypeOf({}, null);

// @ts-expect-error
$Reflect.apply();
// @ts-expect-error
$Reflect.has();
// @ts-expect-error
$Reflect.getPrototypeOf();
// @ts-expect-error
$Reflect.ownKeys();
