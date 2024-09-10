import { existsSync, promises } from 'node:fs';
import { arch } from 'node:os';
import * as path from 'node:path';

import * as extensionApi from '@podman-desktop/api';

import type { GithubReleaseArtifactMetadata, GitHubReleases } from './github-releases';
import { makeExecutable } from './cli-run';

interface ToolConfig {
  name: string;
  extension: string;
  release: GithubReleaseArtifactMetadata;
  archMap: {
    x64: string;
    arm64: string;
  }
}

export class Download {
  private storageBinFolder: string = '';

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

  async setup(): Promise<void> {
    this.storageBinFolder = path.join(this.extensionContext.storagePath, 'bin');
    if (!existsSync(this.storageBinFolder)) {
      await promises.mkdir(this.storageBinFolder, { recursive: true });
    }
  }

  async download(tool: ToolConfig): Promise<void> {
    const assetId = await this.GitHubReleases.getReleaseAssetId(tool.release.id, arch());
    const toolDownloadLocation = path.resolve(this.storageBinFolder, tool.name);

    // Download the asset and make it executable
    await this.GitHubReleases.downloadReleaseAsset(assetId, toolDownloadLocation);
    if (tool.name === 'docker-compose') {
      await makeExecutable(toolDownloadLocation);
    }
  }

  async update(tool: ToolConfig) {
    const latestRelease = await this.getLatestVersionAsset()

    if (tool.release.tag !== latestRelease.tag) {
      tool.release = latestRelease
      await this.download(tool)
    }
  }

  async clean(): Promise<void> {
    if (existsSync(this.storageBinFolder)) {
      await promises.rmdir(this.extensionContext.storagePath, { recursive: true });
    }
  }
}