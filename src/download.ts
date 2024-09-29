import { existsSync, promises } from 'node:fs';
import { arch } from 'node:os';
import * as path from 'node:path';

import * as extensionApi from '@podman-desktop/api';

import { GithubInfo, GithubReleaseArtifactMetadata, GitHubReleases } from './github-releases';
import { extract } from './cli-run';

export interface ToolConfig {
  name: string;
  gh: GithubInfo;
  extension: string;
  release: GithubReleaseArtifactMetadata | null;
  archMap: {
    x64: string;
    arm64: string;
  }
}

export class Download {
  private storageBinFolder: string;
  private _tool: ToolConfig | null = null;
  // private _github: GithubInfo | null = null;

  constructor(
    private readonly extensionContext: extensionApi.ExtensionContext,
    private readonly GitHubReleases: GitHubReleases
  ) {
    this.storageBinFolder = path.join(this.extensionContext.storagePath, 'bin')
  }

  set tool(v: ToolConfig) {
    if (v) {
      this._tool = v;
      this.GitHubReleases.owner = this._tool.gh.owner
      this.GitHubReleases.repo = this._tool.gh.repo
    } else {
      throw new Error("Invalid tool configuration");
    }
  }

  set github(v: GithubInfo) {
    if (v) {
      this.GitHubReleases.owner = v.owner
      this.GitHubReleases.repo = v.repo
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
  async promptUserForVersion(currentTag?: string): Promise<GithubReleaseArtifactMetadata> {
    // Get the latest releases
    let lastReleasesMetadata = await this.GitHubReleases.grabLatestsReleasesMetadata();
    // if the user already has an installed version, we remove it from the list
    if (currentTag) {
      lastReleasesMetadata = lastReleasesMetadata.filter(release => release.tag.slice(1) !== currentTag);
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

  async download(tool: ToolConfig): Promise<void> {
    if (!tool || !tool.release) {
      return
    }
    const toolArch = tool.archMap[arch() as keyof typeof tool.archMap]
    const toolAssetName = `${tool.name}-linux${tool.gh.repo === 'compose' ? '-' : '_'}${toolArch}`
    const assetId = await this.GitHubReleases.getReleaseAssetId(toolAssetName, tool.release.id, tool.extension, tool.gh);

    const toolDownloadLocation = path.resolve(this.storageBinFolder, `${tool.name}${tool.extension}`);

    // await promises.writeFile(path.resolve(this.storageBinFolder, `file_${tool.name}${Math.floor(Math.random() * 1000)}.txt`), '');
    // Download the asset and make it executable
    await this.GitHubReleases.downloadReleaseAsset(assetId, toolDownloadLocation);
    // if (tool.name === 'docker-compose') {
    //   await makeExecutable(toolDownloadLocation);
    // }
    console.log(this.storageBinFolder)
    if (tool.name === 'podman-remote-static') {
      await extract(toolDownloadLocation)
      await promises.rename(
        path.resolve(this.storageBinFolder, 'bin', toolAssetName),
        path.resolve(this.storageBinFolder, tool.name)
      );
      await promises.rm(toolDownloadLocation)
      await promises.rm(path.resolve(this.storageBinFolder, 'bin'), { recursive: true, force: true })
    }
  }

  async update(tool: ToolConfig): Promise<void> {
    const latestRelease = await this.getLatestVersionAsset()
    if (tool && tool.release) {
      if (tool.release.tag !== latestRelease.tag) {
        tool.release = latestRelease
        await this.download(tool)
      }
    }
  }

  async clean(): Promise<void> {
    if (existsSync(this.storageBinFolder)) {
      await promises.rmdir(this.extensionContext.storagePath, { recursive: true });
    }
  }

  checkDownloadedTool(): Boolean {
    if (this._tool && this._tool.name) {
      const toolPath = path.join(this.storageBinFolder, this._tool.name);
      return existsSync(toolPath)
    }
    return false
  }
}