function getItems(): string[] { return ['a', 'b']; }
(getItems as () => string[])().at(-1);
