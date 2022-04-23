import { ParserOptions } from '@babel/parser';

const FILE_EXTENSIONS = ['js', 'jsx', 'ts', 'tsx'];
const initialMap: { [key: string]: boolean } = {};
export const FILE_EXTENSION_MAP = FILE_EXTENSIONS.reduce(
  (accm, fileExtension) => {
    accm[`${fileExtension.startsWith('.') ? '' : '.'}${fileExtension}`] = true;
    return accm;
  },
  initialMap
);
export const IGNORED_FOLDERS = ['node_modules'];
export const PARSER_OPTIONS: ParserOptions = {
  sourceType: 'module',
  plugins: ['jsx', 'typescript'],
};
