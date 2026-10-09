// SPDX-License-Identifier: MIT
const fs = require('node:fs');
const path = require('node:path');
const { spawnSync } = require('node:child_process');
const root = path.join(__dirname, '..');
const { version } = require('../package.json');
const core = fs.readFileSync(path.join(root, 'src/cleaner.js'), 'utf8');
const commands = [
    { file: 'pulisci-diagramma.js', name: 'Pulisci diagramma', action: 'clean' },
    { file: 'ripristina.js', name: 'Ripristina', action: 'restore' }
];
const check = process.argv.includes('--check');

for (const command of commands) {
    const target = path.join(root, 'scripts', command.file);
    const header = `// EA Cardinality Cleaner ${version} - ${command.name}\n` +
        '// Standalone JScript: paste the complete file into an EA Diagram Group.\n' +
        '// Generated from src/cleaner.js. No includes or text input required.\n\n';
    const footer = `\ntry\n{\n    main("${command.action}");\n}\ncatch (error)\n{\n` +
        '    notify("Operazione interrotta.\\n" + errorText(error));\n}\n';
    const source = header + core + footer;
    if (check) {
        if (!fs.existsSync(target) || fs.readFileSync(target, 'utf8') !== source) {
            throw new Error(`${command.file} is out of date. Run npm run build.`);
        }
        const result = spawnSync(process.execPath, ['--check', target], { stdio: 'inherit' });
        if (result.status !== 0) process.exit(result.status || 1);
    } else {
        fs.mkdirSync(path.dirname(target), { recursive: true });
        fs.writeFileSync(target, source);
    }
    console.log(`${check ? 'Checked' : 'Built'} ${command.file}`);
}
