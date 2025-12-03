import $url from '@core-js/pure/full/url/index';

const u1 = new $url('https://example.com/path?name=value#hash');
new $url('/path', 'https://example.com');

let str: string;
str = u1.pathname;
str = u1.hostname;
str = u1.pathname;

str = u1.toJSON();
str = u1.toString();

// @ts-expect-error
new $url(null);
