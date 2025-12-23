/// <reference types="../pure/web/url.d.ts" />

declare namespace CoreJS {
  export type URLParse = (url: string | CoreJSURL, base?: string | CoreJSURL) => CoreJSURL | null;
}
