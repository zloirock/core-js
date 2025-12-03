declare global {
  interface URLConstructor extends URL {
    parse(url: string | URL, base?: string | URL): URL | null;
  }
}

export {};
