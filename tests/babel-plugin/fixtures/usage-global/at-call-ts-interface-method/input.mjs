interface Api { getItems(): string[] }
const api: Api = {} as Api;
api.getItems().at(-1);
