import { existsSync, promises } from 'node:fs';
import { arch } from 'node:os';
import * as path from 'node:path';

import * as extensionApi from '@podman-desktop/api';

import { GithubReleaseArtifactMetadata, GitHubReleases } from './github-releases';
import { makeExecutable } from './cli-run';

export interface ToolConfig {
  name: string;
  org: string;
  repo: string;
  extension: string;
  release: GithubReleaseArtifactMetadata | null;
  archMap: {
    x64: string;
    arm64: string;
  }
}

export class Download{
  private storageBinFolder: string = '';
  private _tool: ToolConfig | null = null;

  constructor(
    private readonly extensionContext: extensionApi.ExtensionContext,
    private readonly GitHubReleases: GitHubReleases
  ) { }

  set tool(v: ToolConfig){
    if (v) {
      this._tool = v;
      this.GitHubReleases.owner = this._tool.org
      this.GitHubReleases.repo = this._tool.repo
    } else {
      throw new Error("Invalid tool configuration");
    }
  }

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

  async download(): Promise<void> {
    if (!this._tool || !this._tool.release) {
      return
    }
    const assetId = await this.GitHubReleases.getReleaseAssetId(this._tool.release.id, arch());
    const toolDownloadLocation = path.resolve(this.storageBinFolder, this._tool.name);

    // Download the asset and make it executable
    await this.GitHubReleases.downloadReleaseAsset(assetId, toolDownloadLocation);
    if (this._tool.name === 'docker-compose') {
      await makeExecutable(toolDownloadLocation);
    }
  }

  async update() {
    const latestRelease = await this.getLatestVersionAsset()
    if (this._tool && this._tool.release) {
      if ( this._tool.release.tag !== latestRelease.tag) {
        this._tool.release = latestRelease
        await this.download()
      }
    }
  }

  async clean(): Promise<void> {
    if (existsSync(this.storageBinFolder)) {
      await promises.rmdir(this.extensionContext.storagePath, { recursive: true });
    }
  }

  checkDownloadedTool() {
    if (this._tool && this._tool.name) {
      const toolPath = path.join(this.storageBinFolder, this._tool.name);
      return existsSync(toolPath)
    }
  }
}