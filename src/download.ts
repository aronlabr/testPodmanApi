import { existsSync, promises } from 'node:fs';
import { arch } from 'node:os';
import * as path from 'node:path';

import * as extensionApi from '@podman-desktop/api';

import type { GithubReleaseArtifactMetadata, GitHubReleases } from './github-releases';
import { makeExecutable } from './cli-run';

export class Download {
  constructor(
    private readonly extensionContext: extensionApi.ExtensionContext,
    private readonly GitHubReleases: GitHubReleases
  ) { }

  // Get the latest version of Compose from GitHub Releases
  // and return the artifact metadata
  async getLatestVersionAsset(): Promise<GithubReleaseArtifactMetadata> {
    const latestReleases = await this.GitHubReleases.grabLatestsReleasesMetadata();
    return latestReleases[0];
  }

  // Get the latest versions of Compose from GitHub Releases
  // and return the artifacts metadata
  async getLatestReleases(): Promise<GithubReleaseArtifactMetadata[]> {
    return this.GitHubReleases.grabLatestsReleasesMetadata();
  }

  // Create a "quickpick" prompt to ask the user which version of Compose they want to download
  async promptUserForVersion(currentComposeTag?: string): Promise<GithubReleaseArtifactMetadata> {
    // Get the latest releases
    let lastReleasesMetadata = await this.GitHubReleases.grabLatestsReleasesMetadata();
    // if the user already has an installed version, we remove it from the list
    if (currentComposeTag) {
      lastReleasesMetadata = lastReleasesMetadata.filter(release => release.tag.slice(1) !== currentComposeTag);
    }

    // Show the quickpick
    const selectedRelease = await extensionApi.window.showQuickPick(lastReleasesMetadata, {
      placeHolder: 'Select Compose version to download',
    });

    if (selectedRelease) {
      return selectedRelease;
    } else {
      throw new Error('No version selected');
    }
  }

  // Download compose from the artifact metadata: GithubReleaseArtifactMetadata
  // this will download it to the storage bin folder as well as make it executeable
  async download(release: GithubReleaseArtifactMetadata): Promise<void> {
    // Get asset id
    const assetId = await this.GitHubReleases.getReleaseAssetId(release.id, arch());

    // Get the storage and check to see if it exists before we download Compose
    const storageData = this.extensionContext.storagePath;
    const storageBinFolder = path.resolve(storageData, 'bin');
    if (!existsSync(storageBinFolder)) {
      await promises.mkdir(storageBinFolder, { recursive: true });
    }

    const dockerComposeDownloadLocation = path.resolve(storageBinFolder, `docker-compose`);

    // Download the asset and make it executable
    await this.GitHubReleases.downloadReleaseAsset(assetId, dockerComposeDownloadLocation);
    await makeExecutable(dockerComposeDownloadLocation);
  }
}