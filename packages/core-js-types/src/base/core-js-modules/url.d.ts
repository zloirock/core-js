declare module 'core-js/internals/web/url' {
  interface URL {
    /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/URL/hash) */
    hash: string;

    /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/URL/host) */
    host: string;

    /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/URL/hostname) */
    hostname: string;

    /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/URL/href) */
    href: string;

    toString(): string;

    /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/URL/origin) */
    readonly origin: string;

    /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/URL/password) */
    password: string;

    /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/URL/pathname) */
    pathname: string;

    /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/URL/port) */
    port: string;

    /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/URL/protocol) */
    protocol: string;

    /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/URL/search) */
    search: string;

    /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/URL/searchParams) */
    readonly searchParams: URLSearchParams;

    /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/URL/username) */
    username: string;

    /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/URL/toJSON) */
    toJSON(): string;
  }

  interface URLConstructor {
    prototype: URL;

    new(url: string | URL, base?: string | URL): URL;

    /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/URL/canParse_static) */
    canParse(url: string | URL, base?: string | URL): boolean;

    /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/URL/createObjectURL_static) */
    createObjectURL(obj: any): string;

    /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/URL/parse_static) */
    parse(url: string | URL, base?: string | URL): URL | null;

    /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/URL/revokeObjectURL_static) */
    revokeObjectURL(url: string): void;
  }

  var URL: URLConstructor;

  interface URLSearchParams {
    readonly size: number;
    append(name: string, value: string): void;
    delete(name: string, value?: string): void;
    get(name: string): string | null;
    getAll(name: string): string[];
    has(name: string, value?: string): boolean;
    set(name: string, value: string): void;
    sort(): void;
    forEach(callbackfn: (value: string, key: string, parent: URLSearchParams) => void, thisArg?: any): void;
    [Symbol.iterator](): URLSearchParamsIterator<[string, string]>;
    entries(): URLSearchParamsIterator<[string, string]>;
    keys(): URLSearchParamsIterator<string>;
    values(): URLSearchParamsIterator<string>;
  }

  interface URLSearchParamsConstructor {
    prototype: URLSearchParams;
    new(init?: string[][] | Record<string, string> | string | URLSearchParams): URLSearchParams;
  }

  var URLSearchParams: URLSearchParamsConstructor;

  interface URLSearchParamsIterator<T> extends IteratorObject<T, BuiltinIteratorReturn, unknown> {
    [Symbol.iterator](): URLSearchParamsIterator<T>;
  }
}
