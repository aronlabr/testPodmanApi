import { Octokit } from '@octokit/rest';
import * as extensionApi from '@podman-desktop/api';

import { getDistros } from './wsl';
import { Download } from './download';
import { Detect } from './detect';
import { GitHubReleases } from './github-releases';

const extInfo: extensionApi.ProviderOptions = {
  name: 'WSL integration lite',
  id: 'wslite',
  status: 'unknown',
  images: {
    icon: './icon.png',
  },
}

// Telemetry
let telemetryLogger: extensionApi.TelemetryLogger | undefined;

export function initTelemetryLogger(): void {
  telemetryLogger = extensionApi.env.createTelemetryLogger();
}

// Activate the extension asynchronously
export async function activate(extensionContext: extensionApi.ExtensionContext): Promise<void> {
  initTelemetryLogger();
  await getDistros()

  // const octokit = new Octokit();
  // const detect = new Detect(extensionContext.storagePath);

  // const composeGitHubReleases = new GitHubReleases(octokit, 'docker', 'compose');
  // const composeDownload = new Download(extensionContext, composeGitHubReleases);

  // const podmanGitHubReleases = new GitHubReleases(octokit, 'containers', 'podman');
  // const podmanDownload = new Download(extensionContext, podmanGitHubReleases);

  // // ONBOARDING: Command to check compose is downloaded
  // const onboardingCheckDownloadCommand = extensionApi.commands.registerCommand(
  //   'compose.onboarding.checkDownloadedCommand',
  //   async () => {
  //     const isDownloaded = await detect.getStoragePath();
  //     if (isDownloaded === '') {
  //       extensionApi.context.setValue('composeIsNotDownloaded', true, 'onboarding');
  //     } else {
  //       extensionApi.context.setValue('composeIsNotDownloaded', false, 'onboarding');
  //     }

  //     await handler.updateConfigAndContextComposeBinary(extensionContext);

  //     if (!isDownloaded) {
  //       // Get the latest version and store the metadata in a local variable
  //       const composeLatestVersion = await composeDownload.getLatestVersionAsset();
  //       // Set the value in the context to the version we're downloading so it appears in the onboarding sequence
  //       if (composeLatestVersion) {
  //         composeVersionMetadata = composeLatestVersion;
  //         extensionApi.context.setValue('composeDownloadVersion', composeVersionMetadata.tag, 'onboarding');
  //       }
  //     }

  //     telemetryLogger?.logUsage('compose.onboarding.checkDownloadedCommand', {
  //       downloaded: isDownloaded === '' ? false : true,
  //       version: composeVersionMetadata?.tag,
  //     });
  //   },
  // );

  // Push the commands that will be used within the onboarding sequence
  // extensionContext.subscriptions.push(
  //   onboardingCheckDownloadCommand,
  // );

  let testInput = await extensionApi.window.showInputBox({
    title: "Hello",
    markdownDescription: "Hola extension",
    valueSelection: [1,2]
  })
  // extensionApi.commands.registerCommand(`${extInfo.id}.once`, testInput)
  // Create a provider with an example name, ID and icon
  const provider = extensionApi.provider.createProvider(extInfo);

  // Push the new provider to Podman Desktop
  extensionContext.subscriptions.push(provider);
}

// Deactivate the extension
export function deactivate(): void {
  console.log('stopping wsl-int extension');
}

// extensionApi.InputBoxOptions

// const telemetryConfigurationNode = {
//   id: 'preferences.telemetry',
//   title: 'Telemetry',
//   type: 'object',
//   properties: {
//     ['wsl' + '.' + 'enabled']: {
//       markdownDescription:
//         'Help improve Podman Desktop by allowing anonymous usage data to be sent to Red Hat. Read our [Privacy statement](https://developers.redhat.com/article/tool-data-collection)',
//       type: 'boolean',
//       default: true,
//     },
//     ['wsl' + '.' + 'checked']: {
//       description: 'Dialog prompt for telemetry',
//       type: 'boolean',
//       default: false,
//       hidden: true,
//     },
//   },
// };

// this.configurationRegistry.registerConfigurations([telemetryConfigurationNode]);