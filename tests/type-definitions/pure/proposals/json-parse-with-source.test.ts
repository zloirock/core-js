import $rawJSON from '@core-js/pure/full/json/raw-json';
import $isRawJSON from '@core-js/pure/full/json/is-raw-json';
import $parse from '@core-js/pure/full/json/parse';

interface CoreJSReviverContext {
  source?: string;
}

type RawJSON = ReturnType<typeof $rawJSON>;

const r: RawJSON = $rawJSON('{"a":123}');
// @ts-expect-error
const fake: RawJSON = { rawJSON: '123' };

const isr1: boolean = $isRawJSON(r);
const isr2: boolean = $isRawJSON({});
const isr3: boolean = $isRawJSON('abc');
const isr4: boolean = $isRawJSON(undefined);

declare const smth: unknown;

if ($isRawJSON(smth)) {
  smth.rawJSON;
  const s: string = smth.rawJSON;
  // @ts-expect-error
  smth.noProp;
}

// @ts-expect-error
$rawJSON(123);
// @ts-expect-error
$rawJSON();
// @ts-expect-error
$isRawJSON();

$parse('{"tooBigForNumber":9007199254740993}', (key: string, value: any, context: CoreJSReviverContext) => {});
$parse('{"tooBigForNumber":9007199254740993}', (key, value, context) => {
  const source: string | undefined = context.source;
  return value;
});
// @ts-expect-error
$parse('{"tooBigForNumber":9007199254740993}', (key: string, value: any, context: []) => {});
