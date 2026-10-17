// iteration hands elements out like a spread does - it bails
const looped = [[1], [2]];
for (const el of looped) use(el);