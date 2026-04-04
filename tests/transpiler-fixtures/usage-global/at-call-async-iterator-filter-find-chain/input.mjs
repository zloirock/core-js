const result = await Object.keys(x).values().toAsync().filter(fn).find(g);
result.at(0);
