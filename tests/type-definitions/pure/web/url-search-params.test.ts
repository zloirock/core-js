import $urlSearchParams from '@core-js/pure/full/url-search-params/index';

const ps1 = new $urlSearchParams();
new $urlSearchParams('a=1&b=2');
new $urlSearchParams([['a', '1'], ['b', '2']]);
new $urlSearchParams(ps1);
new $urlSearchParams({ foo: "bar" });

// @ts-expect-error
new $urlSearchParams(42);

ps1.append('k', 'v');
// @ts-expect-error
ps1.append();
// @ts-expect-error
ps1.append('a', 5);

ps1.delete('k');
// @ts-expect-error
ps1.delete();

const getResult: string | null = ps1.get('foo');

const allResult: string[] = ps1.getAll('foo');

const hasResult: boolean = ps1.has('foo');

ps1.set('foo', 'bar');
// @ts-expect-error
ps1.set('foo', 1);
// @ts-expect-error
ps1.set('foo');

ps1.sort();

const str: string = ps1.toString();
