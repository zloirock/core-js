import 'core-js/full';

declare const execArr: RegExpExecArray;
declare const matchArr: RegExpMatchArray;

const execGroups: { [key: string]: string } | undefined = execArr.groups;
const matchGroups: { [key: string]: string } | undefined = matchArr.groups;

if (execGroups) {
  const foo: string | undefined = execGroups.foo;
  const bar: string | undefined = execGroups["bar"];
}

if (matchGroups) {
  const baz: string | undefined = matchGroups.baz;
  const qr: string | undefined = matchGroups["qr"];
}

// Динамический ключ:
if (execGroups) {
  const key = "dynamic";
  const dyn: string | undefined = execGroups[key];
}

const first: string = execArr[0];
const mfirst: string = matchArr[0];

// @ts-expect-error
execArr.groups = { foo: 123 };
// @ts-expect-error
execArr.groups = "bad";
// @ts-expect-error
matchArr.groups = { baz: 123 };
// @ts-expect-error
matchArr.groups = 42;
// @ts-expect-error
execGroups.foo = 1;
// @ts-expect-error
const n: number = execGroups && execGroups.foo;
// @ts-expect-error
const b: boolean = execArr.groups && execArr.groups.bar;
// @ts-expect-error
const numFirst: number = execArr[0];
// @ts-expect-error
const arrTest: string[] = execArr.groups;
