import * as extensionApi from '@podman-desktop/api';

import { Detect } from './detect';
import { ToolConfig } from './download';
import path from 'path';
import { existsSync } from 'fs';

// Handle configuration changes (for example, when the user toggles the "Install compose system-wide" setting)
// export function handleConfigurationChanges(extensionContext: extensionApi.ExtensionContext): void {
//   const detect = new Detect(os, extensionContext.storagePath);

//   extensionApi.configuration.onDidChangeConfiguration(async e => {
//     if (e.affectsConfiguration('compose.binary.installComposeSystemWide')) {
//       await handleComposeBinaryToggle(detect, extensionContext);
//     }
//   });
// }

export async function checkBinInstalled(extensionContext: extensionApi.ExtensionContext, tools: ToolConfig[]) {
  const storageBinFolder = path.join(extensionContext.storagePath, 'bin')
  const areInstalled = tools.map( tool => {
    const toolPath = path.join(storageBinFolder, tool.name);
    return existsSync(toolPath)
  })
  extensionApi.context.setValue('wslite.binsAreInstalled', areInstalled.every( v => v));
}

export async function checkAndUpdateComposeBinaryInstalledContexts(tools: string[]): Promise<void> {
  // Detect and update the configuration setting to either true / false
  const binStorage = ""
  // const isDockerComposeInstalledSystemWide = await detect.checkSystemWideDockerCompose();
  // await extensionApi.configuration
  //   .getConfiguration('compose')
  //   .update('binary.installComposeSystemWide', isDockerComposeInstalledSystemWide);

  // // Update the compose onboarding context for installComposeSystemWide is either true or false
  // extensionApi.context.setValue('compose.isComposeInstalledSystemWide', isDockerComposeInstalledSystemWide);
}