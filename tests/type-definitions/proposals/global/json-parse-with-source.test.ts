import 'core-js/full';

const r: CoreJSRawJSON = JSON.rawJSON('{"a":123}');

const isr1: boolean = JSON.isRawJSON(r);
const isr2: boolean = JSON.isRawJSON({});
const isr3: boolean = JSON.isRawJSON('abc');
const isr4: boolean = JSON.isRawJSON(undefined);

declare const smth: unknown;

if (JSON.isRawJSON(smth)) {
  smth.rawJSON;
  const s: string = smth.rawJSON;
  // @ts-expect-error
  smth.noProp;
}

// @ts-expect-error
JSON.rawJSON(123);
// @ts-expect-error
JSON.rawJSON();

JSON.parse('{"tooBigForNumber":9007199254740993}', (key: string, value: any, context: CoreJSReviverContext) => {});
// @ts-expect-error
JSON.parse('{"tooBigForNumber":9007199254740993}', (key: string, value: any, context: []) => {});
