import * as extensionApi from '@podman-desktop/api';

import { Detect } from './detect';

// Handle configuration changes (for example, when the user toggles the "Install compose system-wide" setting)
export function handleConfigurationChanges(detect: Detect): void {
  extensionApi.configuration.onDidChangeConfiguration(async e => {
    if (e.affectsConfiguration('compose.binary.install')) {
      // await handleComposeBinaryToggle(detect);
    }
    if (e.affectsConfiguration('podman.binary.install')) {
      
    }
  });
}


export async function checkAndUpdateComposeBinaryInstalledContexts(detect: Detect): Promise<void> {
  // Detect and update the configuration setting to either true / false
  const isDockerComposeInstalledSystemWide = await detect.checkSystemWideDockerCompose();
  await extensionApi.configuration
    .getConfiguration('compose')
    .update('binary.installComposeSystemWide', isDockerComposeInstalledSystemWide);

  // Update the compose onboarding context for installComposeSystemWide is either true or false
  extensionApi.context.setValue('compose.isComposeInstalledSystemWide', isDockerComposeInstalledSystemWide);
}