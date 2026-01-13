import 'core-js/full';

const u1: URL | null = URL.parse('https://example.com/path?name=value#hash');
URL.parse('/path', 'https://example.com');

if (u1) {
  let str: string;
  str = u1.pathname;
  str = u1.hostname;
  str = u1.pathname;

  str = u1.toJSON();
  str = u1.toString();
}

// @ts-expect-error
URL.parse(null);
