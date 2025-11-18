declare global {
  interface URLConstructor {
    parse(url: string | URL, base?: string | URL): URL | null;
  }
}

export {};
