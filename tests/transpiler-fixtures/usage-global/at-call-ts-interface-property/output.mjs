import "core-js/modules/es.array.at";
interface Api {
  items: string[];
}
const api: Api = {} as Api;
api.items.at(-1);