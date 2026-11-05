import { readdir, readFile, mkdir, writeFile } from 'node:fs/promises';
import { join, relative } from 'node:path';
import { zipSync } from 'fflate';

// Zip entregable con código, documentación y build, sin dependencias ni secretos.
const root = process.cwd();
const excluded = new Set(['node_modules', '.git', 'artifacts', '.env', '.DS_Store']);
const files = {};
async function collect(directory) {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    if (excluded.has(entry.name) || entry.name.startsWith('.env.')) continue;
    const full = join(directory, entry.name);
    if (entry.isDirectory()) await collect(full);
    else if (entry.isFile())
      files[`vesper/${relative(root, full).replaceAll('\\', '/')}`] = new Uint8Array(
        await readFile(full),
      );
  }
}
await collect(root);
await mkdir(join(root, 'artifacts'), { recursive: true });
await writeFile(join(root, 'artifacts/vesper-entrega-2.zip'), zipSync(files, { level: 6 }));
console.log(`Generado artifacts/vesper-entrega-2.zip (${Object.keys(files).length} archivos).`);
