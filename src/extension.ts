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
  // initTelemetryLogger();
  // await getDistros();

  // let testInput = await extensionApi.window.showInputBox({
  //   title: "Hello",
  //   markdownDescription: "Hola extension",
  //   valueSelection: [1, 2]
  // });
  // extensionApi.commands.registerCommand(`${extInfo.id}.once`, testInput)
  // Create a provider with an example name, ID and icon
  const provider = extensionApi.provider.createProvider(extInfo);
  const myFirstCommand = extensionApi.commands.registerCommand(`${extInfo.id}.hello`, async () => {
    // display a choice to the user for selecting some values
    const result = await extensionApi.window.showQuickPick(['un', 'deux', 'trois'], {
      canPickMany: true, // user can select more than one choice
    });

    // display an information message with the user choice
    await extensionApi.window.showInformationMessage(`The choice was: ${result}`);
  });

  // create an item in the status bar to run our command
  // it will stick on the left of the status bar
  const item = extensionApi.window.createStatusBarItem(extensionApi.StatusBarAlignLeft, 100);
  item.text = 'My first command';
  item.command = `${extInfo.id}.hello2`;
  item.show();

  // Push the new provider to Podman Desktop
  extensionContext.subscriptions.push(provider);
  
  extensionContext.subscriptions.push(myFirstCommand);
  extensionContext.subscriptions.push(item);

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