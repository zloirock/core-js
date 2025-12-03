import $canParse from '@core-js/pure/full/url/can-parse';

const u1: boolean = $canParse('https://example.com/path?name=value#hash');
const u2: boolean = $canParse('/path', 'https://example.com');

// @ts-expect-error
$canParse(null);
