import "core-js/modules/es.array.at";
interface Api {
  each(cb: (x: string[]) => void): void;
}
declare const api: Api;
api.each(x => x.at(0));