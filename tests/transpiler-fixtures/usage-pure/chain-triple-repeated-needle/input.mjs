// three Array.from references in one expression - tests nth-adjustment in nested composition
Array.from(a).filter(Array.from).reduce(Array.from, 0);
