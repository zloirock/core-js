type API = { getUser(): { tags: string[] } };
declare const api: API;
api.getUser().tags.at(-1);
