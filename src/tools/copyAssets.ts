import * as shell from 'shelljs';
import * as path from 'path';
import * as fs from 'fs';

const projectRoot = path.resolve(__dirname, '..', '..');
const sourcePath = path.join(projectRoot, 'src', 'libs', 'src', 'mailer', 'emails');
const destPath = path.join(projectRoot, 'dist', 'libs', 'src', 'mailer', 'emails');

// Crea la carpeta de destino si no existe
if (!fs.existsSync(destPath)) {
  fs.mkdirSync(destPath, { recursive: true });
}

// Copia los archivos
shell.cp('-R', `${sourcePath}/*`, destPath);

console.log(`Copied files from ${sourcePath} to ${destPath}`);
