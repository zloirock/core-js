// A static default stays inside its for-of head and sees the selected element.
for (const { fromEntries, getOwnPropertyNames: viaDefault = 0 } of [Object]) fromEntries([[viaDefault]]);
