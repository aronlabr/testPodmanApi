import { existsSync, promises } from 'node:fs';
import * as path from 'node:path';

import * as extensionApi from '@podman-desktop/api';

const localBinDir = '~/local/bin';

export function getSystemBinaryPath(binaryName: string): string {
  return path.join(localBinDir, binaryName);
}

// Takes a binary path (e.g. /tmp/docker-compose) and installs it to the system. Renames it based on binaryName
export async function installBinaryToSystem(binaryPath: string, binaryName: string): Promise<void> {
  try {
    await extensionApi.process.exec('chmod', ['+x', binaryPath]);
    console.log(`Made ${binaryPath} executable`);
  } catch (error) {
    throw new Error(`Error making binary executable: ${error}`);
  }

  // Create the appropriate destination path (Windows uses AppData/Local, Linux and Mac use /usr/local/bin)
  // and the appropriate command to move the binary to the destination path
  const destinationPath: string = getSystemBinaryPath(binaryName);
  let command = '/bin/sh';
  let args: string[] = ['-c', `cp ${binaryPath} ${destinationPath}`];

  // If on macOS or Linux, check to see if the /usr/local/bin directory exists,
  // if it does not, then add mkdir -p /usr/local/bin to the start of the command when moving the binary.
  if (!existsSync(localBinDir)) {
    // add mkdir -p /usr/local/bin just after the first item or args array (so it'll be in the -c shell instruction)
    args[args.length - 1] = `mkdir -p ${localBinDir} && ${args[args.length - 1]}`;
  }

  try {
    if (!command) {
      throw new Error('No command defined');
    }
    await extensionApi.process.exec(command, args, { isAdmin: false });
    console.log(`Successfully installed '${binaryName}' binary.`);
  } catch (error) {
    console.error(`Failed to install '${binaryName}' binary: ${error}`);
    throw error;
  }
}

export async function makeExecutable(filePath: string): Promise<void> {
  // eslint-disable-next-line sonarjs/file-permissions
  await promises.chmod(filePath, 0o755);
}