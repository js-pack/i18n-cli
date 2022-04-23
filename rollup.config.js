import fs from 'fs';
import typescript from 'rollup-plugin-typescript2';
import { terser } from 'rollup-plugin-terser';
import prettier from 'rollup-plugin-prettier';
import json from '@rollup/plugin-json';

import packageJson from './package.json';
const license = fs.readFileSync('./LICENSE.md', { encoding: 'utf-8' });
let preamble = '#!/usr/bin/env node\n\n';
preamble +=
  '/*! *****************************************************************************\n';
preamble += license;
preamble += `***************************************************************************** */\n`;

export default [
  {
    input: './src/index.ts',
    output: [{ file: packageJson.bin['i18n-cli'], format: 'cjs' }],
    external: [
      ...Object.keys(packageJson.peerDependencies ?? {}),
      'fs',
      'path',
    ],
    plugins: [
      json(),
      typescript({
        tsconfigOverride: { exclude: ['**/*.test.ts'] },
      }),
      terser({
        compress: false,
        mangle: false,
        format: {
          comments: false,
          preamble,
        },
      }),
      prettier({
        parser: 'babel',
        singleQuote: true,
        trailingComma: 'es5',
        bracketSpacing: true,
      }),
    ],
  },
];
