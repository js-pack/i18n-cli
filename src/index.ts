import * as commands from './commands';
const program = require('commander');
import packageJson from '../package.json';

program.version(packageJson.version);

type ParseOptionsType = {
  filePath: string;
  outputFolder: string;
  supportedLocales: string;
  info: boolean;
};
program
  .command('parse [file-path] [output-folder] [supported-locales]')
  .option('--file-path <string>')
  .option('--output-folder <string>')
  .option('--supported-locales <string>')
  .option('--info')
  .description('parses specified file or folder recursively')
  .action(
    (
      filePath: string = '.',
      outputFolder: string = '.',
      supportedLocales: string = 'translations',
      opts: ParseOptionsType
    ) => {
      commands.parse({
        filePath: opts.filePath ?? filePath,
        outputFolder: opts.outputFolder ?? outputFolder,
        supportedLocales: opts.supportedLocales ?? supportedLocales,
        generateInfo: opts.info,
      });
    }
  );

program
  .command('check [file-path]')
  .description(
    'checks usage of i18n library on specified file or folder recursively'
  )
  .action((filePath: string = '.') => {
    commands.check({ filePath });
  });

program.parse(process.argv);
