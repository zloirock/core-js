/// <reference types="./url.d.ts" />

declare namespace CoreJS {
  export type URLParse = (url: string | CoreJSURL, base?: string | CoreJSURL) => CoreJSURL | null;
}
