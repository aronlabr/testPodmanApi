import { promises } from 'node:fs';
import * as path from 'node:path';

import * as extensionApi from '@podman-desktop/api';

const localBinDir = '~/.local/bin';

export function getSystemBinaryPath(binaryName: string): string {
  return path.join(localBinDir, binaryName);
}

export async function makeExecutable(filePath: string): Promise<void> {
  // eslint-disable-next-line sonarjs/file-permissions
  await promises.chmod(filePath, 0o755);
}

async function moveFilesToParentDir(directory: string): Promise<void> {
  // Read the directory contents
  const files = await promises.readdir(directory);
  Promise.all(
    files.map(async file => {

      const filePath = path.join(directory, file);
      const stats = await promises.stat(filePath)

      if (stats.isDirectory()) {
        await moveFilesToParentDir(filePath)
        const subfiles = await promises.readdir(filePath)
        if (subfiles.length === 0) {
          // Deleted empty directory
          await promises.rmdir(filePath)
        }
      } else {
        const destPath = path.join(directory, '..', file);
        await promises.rename(filePath, destPath)
      }
    })
  )
}

export async function extract(directory: string) {
  const files = await promises.readdir(directory);
  const tarsFiles = files.filter(file => file.endsWith('.tar.gz'));

  Promise.all(
    tarsFiles.map( async tarPath => {
      const { stderr } = await extensionApi.process.exec('tar', ['-xzf', tarPath])
      if (stderr) {
        console.error(`Error in output: ${stderr}`);
        return;
      }
    })
  );

  await moveFilesToParentDir(directory)
}