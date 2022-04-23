import {
  FILE_EXTENSION_MAP,
  IGNORED_FOLDERS,
  PARSER_OPTIONS,
} from './constants';
import fs from 'fs';
import path from 'path';
const parser = require('@babel/parser');
const traverse = require('@babel/traverse').default;
type ParseOptions = {
  filePath: string;
  outputFolder: string;
  supportedLocales: string;
  generateInfo: boolean;
};
type ProcessVarsType = { [key: number]: { [key: string]: any } };

const processVars: ProcessVarsType = {
  [process.pid]: {
    keys: {},
  },
};

const getKey = (args: any) => {
  const [arg0, arg1] = args;
  let prop;
  if (arg1) {
    prop = arg1.properties.find((p: any) => p?.key?.name === 'context');
  }
  if (prop?.value?.value) {
    return `${arg0.value}_${prop.value.value}`;
  }
  return arg0.value;
};

const parseFile = (filePath: string) => {
  const code = fs.readFileSync(filePath, { encoding: 'utf-8' });
  const parsedTree = parser.parse(code, PARSER_OPTIONS);

  traverse(parsedTree, {
    CallExpression: function (treePath: any) {
      if (treePath.node.callee.name === 't') {
        const arg = treePath.node.arguments[0];
        const key = getKey(treePath.node.arguments);
        if (key) {
          processVars[process.pid].keys[key] =
            processVars[process.pid].keys[key] || {};
          processVars[process.pid].keys[key][filePath] =
            processVars[process.pid].keys[key][filePath] || [];
          processVars[process.pid].keys[key][filePath].push({
            position: arg.loc.start,
          });
        }
      }
    },
  });
};

const tryCreateOutputFolders = (outputFolder: string) => {
  try {
    fs.mkdirSync(outputFolder);
  } catch {}
};

const writeInfoFile = (outputFolder: string) => {
  fs.writeFile(
    path.join(outputFolder, 'i18n-info.json'),
    `${JSON.stringify(processVars[process.pid], null, 2)}\n`,
    () => {}
  );
};

const writeTranslationFiles = (outputFolder: string, supporteds: string[]) => {
  supporteds.forEach((supportedLocale) => {
    const initialKeys: { [keys: string]: any } = {};
    const resourcePath = path.join(
      process.cwd(),
      outputFolder,
      `${supportedLocale}.json`
    );
    let existedKeyMap: { [key: string]: string } = {};
    try {
      existedKeyMap = require(resourcePath);
    } catch {}
    const newKeyMap = {
      ...Object.keys(processVars[process.pid].keys).reduce((accm, item) => {
        accm[item] = existedKeyMap[item] || '';
        return accm;
      }, initialKeys),
    };
    fs.writeFile(
      resourcePath,
      `${JSON.stringify(newKeyMap, null, 2)}\n`,
      () => {}
    );
  });
};

const parse = ({
  filePath,
  outputFolder,
  supportedLocales,
  generateInfo,
}: ParseOptions) => {
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

  const outFolder = path.join(outputFolder || path.dirname(filePath), './i18n');
  const supporteds = supportedLocales.split(',');

  tryCreateOutputFolders(outFolder);
  generateInfo && writeInfoFile(outFolder);
  writeTranslationFiles(outFolder, supporteds);
};

export default parse;
