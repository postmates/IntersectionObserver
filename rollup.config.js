import ts from 'rollup-plugin-typescript2';

export default [{
  input: 'src/index.tsx',
  output: [
    { file: 'dist/index.cjs.js', format: 'cjs' },
    { file: 'dist/index.es.js', format: 'es' },
  ],
  external: [
    'react',
  ],
  plugins: [
    ts(),
  ],
}];
