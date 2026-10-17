globalThis.scriptBox = { list: ['ab', 'cd'], n: 7 };
(globalThis.window?.self.scriptBox.list ?? []).forEach(function () {});
