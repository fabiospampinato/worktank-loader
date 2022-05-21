
const dist = `
  export {foo1}
  export {foo2, bar3}
  export {
    foo4,
    bar5
  }

  export {foo as bar6}
  export {foo7, bar as baz8}
  export {
    foo as bar9
  }
  export {
    foo10,
    bar as baz11
  }
`;

const names = [];
const contentRe = /^\s*export\s+{\s*([^{}]*?)\s*}/gm;
const exportRe = /([a-zA-Z$_][a-zA-Z0-9$_]*)(?:\s+as\s+([a-zA-Z$_][a-zA-Z0-9$_]*))?/gm;
const contents = Array.from ( dist.matchAll ( contentRe ) ).map ( match => match[1] );

for ( const content of contents ) {
  const exports = Array.from ( content.matchAll ( exportRe ) ).map ( match => match[2] || match[1] );
  names.push ( ...exports );
}

const namesUniq = Array.from ( new Set ( names ) );

console.log(contents);
console.log ( names );
console.log ( namesUniq );
