/// <reference types="./url.d.ts" />

declare namespace CoreJS {
    export interface CoreJSURLConstructor {
      parse(url: string | CoreJSURL, base?: string | CoreJSURL): CoreJSURL | null;
    }
}
