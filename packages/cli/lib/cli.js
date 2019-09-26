const meow = require('meow')
const ora = require('ora');

const fs = require('fs')
const path = require('path')

const figma = require('@figma-export/core');

const cli = meow(`usage: figma-export <command> <file-id>

In order to use figma-export you need a valid Access Token.
$ export FIGMA_TOKEN=<figma-access-token>

These are all available <command>s:
    components      Exports components from a Figma file

Options:
    -p, --page          Figma page names (defaults to 'all pages')
    -o  --output        Output directory (defaults to './output')
    -O, --outputter     Path to outputter function
    -t, --transformer   Path to transform function
`,
    {
        flags: {
            output: {
                type: 'string',
                default: 'output',
                alias: 'o'
            },
            page: {
                type: 'string',
                alias: 'p',
            },
            transformer: {
                type: 'string',
                alias: 'T'
            },
            outputter: {
                type: 'string',
                alias: 'O',
                default: '@figma-export/output-components-as-stdout'
            }
        },
    },
)

const resolveNameOrPath = (objs = []) => {
    const objsAsArray = Array.isArray(objs) ? objs : [objs];

    return objsAsArray.map(nameOrPath => {
        let absolutePath = path.resolve(nameOrPath);
        return fs.existsSync(absolutePath) ? absolutePath : nameOrPath;
    })
}

const [cli_command, cli_fileId] = cli.input

const output = path.resolve(cli.flags.output);

const cli_options = {
    ...cli.flags,
    output,
    transformer: resolveNameOrPath(cli.flags.transformer),
    outputter: resolveNameOrPath(cli.flags.outputter)
}

figma.setToken(process.env.FIGMA_TOKEN);

switch (cli_command) {

    case 'components':
        const spinner = ora('Loading unicorns').start();

        figma.exportComponents(cli_fileId, {
            output: cli_options.output,
            onlyFromPages: cli_options.page,
            transformers: cli_options.transformer,
            outputters: cli_options.outputter,
            updateStatusMessage: message => spinner.text = message
        }).then(() => {
            spinner.stop()
        }).catch(err => {
            spinner.stop()
            console.error(err.message)
        })

        break;
}