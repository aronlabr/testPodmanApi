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