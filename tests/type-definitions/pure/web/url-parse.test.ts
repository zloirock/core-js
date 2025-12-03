import $parse from '@core-js/pure/full/url/parse';

const u1 = $parse('https://example.com/path?name=value#hash');
$parse('/path', 'https://example.com');

if (u1) {
  $parse(u1);

  let str: string;
  str = u1.pathname;
  str = u1.hostname;
  str = u1.pathname;

  str = u1.toJSON();
  str = u1.toString();
}

// @ts-expect-error
$parse(null);
