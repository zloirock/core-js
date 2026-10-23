import 'core-js/es';
import rawJSON from 'core-js/es/json/raw-json';
import isRawJSON from 'core-js/es/json/is-raw-json';
import { assertBool } from '../../helpers/helpers.js';

const resNS: RawJSON = rawJSON('{"a":123}');
assertBool(isRawJSON(resNS));

// @ts-expect-error
rawJSON();
// @ts-expect-error
isRawJSON();

const r: RawJSON = JSON.rawJSON('{"a":123}');
// @ts-expect-error
const fake: RawJSON = { rawJSON: '123' };

assertBool(JSON.isRawJSON(r));
assertBool(JSON.isRawJSON({}));
assertBool(JSON.isRawJSON('abc'));
assertBool(JSON.isRawJSON(undefined));

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

JSON.parse('{"tooBigForNumber":9007199254740993}', (key: string, value: any, context: { source?: string }) => {});
JSON.parse('{"tooBigForNumber":9007199254740993}', (key, value, context) => {
  const source: string | undefined = context.source;
  return value;
});
// @ts-expect-error
JSON.parse('{"tooBigForNumber":9007199254740993}', (key: string, value: any, context: []) => {});
