import {
  FILE_EXTENSION_MAP,
  IGNORED_FOLDERS,
  PARSER_OPTIONS,
} from './constants';
import fs from 'fs';
import path from 'path';
const parser = require('@babel/parser');
const traverse = require('@babel/traverse').default;
type CheckOptions = {
  filePath: string;
};
const colors = {
  reset: '\x1b[0m',
  fgRed: '\x1b[31m',
  fgGreen: '\x1b[32m',
  fgYellow: '\x1b[33m',
  underscore: '\x1b[4m',
};
const processVars = {
  [process.pid]: {
    errors: 0,
  },
};

const parseFile = (filePath: string) => {
  const code = fs.readFileSync(filePath, { encoding: 'utf-8' });
  const parsedTree = parser.parse(code, PARSER_OPTIONS);

  traverse(parsedTree, {
    CallExpression: function (treePath: any) {
      if (treePath.node.callee.name === 't') {
        const arg = treePath.node.arguments[0];

        if (arg && arg.type !== 'StringLiteral') {
          processVars[process.pid].errors++;
          console.log(
            `${colors.fgYellow}Warning ${processVars[process.pid].errors}:`
          );
          console.log(
            `${colors.reset}translate function only accepts ${colors.fgGreen}[StringLiteral]${colors.reset} but you used ${colors.fgRed}[${arg.type}]${colors.reset}`
          );
          console.log(
            'file:',
            `${colors.fgYellow}${colors.underscore}${filePath}:${arg.loc.start.line}:${arg.loc.start.column}${colors.reset}`
          );
          console.log(`allowed quotes are ${colors.fgGreen}[']["]`);
          console.log('-------------------');
        }
      }
    },
  });
};

const check = ({ filePath }: CheckOptions) => {
  const parseRecursively = (folder: string) => {
    if (!IGNORED_FOLDERS.includes(folder)) {
      fs.readdirSync(folder).forEach((fileName: string) => {
        const filePath = path.join(folder, fileName);
        const stat = fs.statSync(filePath);
        if (stat.isDirectory()) {
          parseRecursively(filePath);
        } else if (FILE_EXTENSION_MAP[path.extname(fileName)]) {
          parseFile(filePath);
        }
      });
    }
  };

  parseRecursively(filePath);
};

export default check;
