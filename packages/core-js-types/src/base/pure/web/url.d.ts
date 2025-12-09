/// <reference types="./url-search-params.d.ts" />

declare namespace CoreJS {
  export interface CoreJSURL {
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
    readonly searchParams: CoreJSURLSearchParams;

    /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/URL/username) */
    username: string;

    /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/URL/toJSON) */
    toJSON(): string;
  }

  export interface CoreJSURLConstructor {
    new(url: string, base?: string): CoreJSURL;

    /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/URL/canParse_static) */
    canParse(url: string, base?: string): boolean;

    /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/URL/createObjectURL_static) */
    createObjectURL(obj: any): string;

    /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/URL/parse_static) */
    parse(url: string, base?: string): CoreJSURL | null;

    /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/URL/revokeObjectURL_static) */
    revokeObjectURL(url: string): void;
  }

  var CoreJSURL: CoreJSURLConstructor;
}
