import { promises } from 'node:fs';
import * as path from 'node:path';

import * as extensionApi from '@podman-desktop/api';
import decompress from '@xhmikosr/decompress';
import decompressTargz from '@xhmikosr/decompress-targz';

const localBinDir = '~/.local/bin';

export function getSystemBinaryPath(binaryName: string): string {
  return path.join(localBinDir, binaryName);
}

export async function makeExecutable(filePath: string): Promise<void> {
  // eslint-disable-next-line sonarjs/file-permissions
  await promises.chmod(filePath, 0o755);
}

export async function extract(filePath: string) {
  const dist = path.dirname(filePath)
  const files = await decompress(filePath, dist, {
    // filter: file => file.path.endsWith('.txt'), // Example filter
    plugins: [
      decompressTargz() // Add the Targz plugin
    ]
  });
  console.log('Decompressed files:', files);
}
