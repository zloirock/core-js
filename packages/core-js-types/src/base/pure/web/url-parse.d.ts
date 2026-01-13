/// <reference types="../core-js-types/url" />

declare namespace CoreJS {
  export type URLParse = (url: string | CoreJSURL, base?: string | CoreJSURL) => CoreJSURL | null;
}
