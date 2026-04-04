import "core-js/modules/es.array.at";
interface Api {
  getItems(): string[];
}
const api: Api = {} as Api;
api.getItems().at(-1);