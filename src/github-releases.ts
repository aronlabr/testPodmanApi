import { existsSync, promises } from 'node:fs';
import * as path from 'node:path';

import type { Octokit } from '@octokit/rest';
import { QuickPickItem } from '@podman-desktop/api';
import { arch } from 'node:os';

export interface GithubReleaseArtifactMetadata extends QuickPickItem {
  tag: string;
  id: number;
}

// Allows to interact with Tool Releases on GitHub
export class GitHubReleases {
  private _owner: string;
  private _repository: string;

  constructor(private readonly octokit: Octokit) { 
    this._owner = ''
    this._repository = ''
  }

  set owner(v: string) {
    this._owner = v;
  }

  set repo(v: string) {
    this._repository = v;
  }
  
  // Provides last 5 majors releases from GitHub using the GitHub API
  // return name, tag and id of the release
  async grabLatestsReleasesMetadata(): Promise<GithubReleaseArtifactMetadata[]> {
    // Grab last 5 majors releases from GitHub using the GitHub API

    const lastReleases = await this.octokit.repos.listReleases({
      owner: this._owner,
      repo: this._repository,
      
    });

    // keep only releases and not pre-releases
    lastReleases.data = lastReleases.data.filter(release => !release.prerelease);

    // keep only the last 5 releases
    lastReleases.data = lastReleases.data.slice(0, 5);

    return lastReleases.data.map(release => {
      return {
        label: release.name ?? release.tag_name,
        tag: release.tag_name,
        id: release.id,
      };
    });
  }

  // Get the asset id of a given release number for a given operating system and architecture
  // arch: x64, arm64 (see os.arch())
  async getReleaseAssetId(releaseId: number, assetName: string, extension: string): Promise<number> {
    const listOfAssets = await this.octokit.repos.listReleaseAssets({
      owner: this._owner,
      repo: this._repository,
      release_id: releaseId,
    });

    // search for the right asset
    const asset = listOfAssets.data.find(asset => `${assetName}${extension}` === asset.name);
    if (!asset) {
      throw new Error(`No asset found for linux and ${arch()}`);
    }

    return asset.id;
  }

  // download the given asset id
  async downloadReleaseAsset(assetId: number, destination: string): Promise<void> {
    const asset = await this.octokit.repos.getReleaseAsset({
      owner: this._owner,
      repo: this._repository,
      asset_id: assetId,
      headers: {
        accept: 'application/octet-stream',
      },
    });

    // check the parent folder exists
    const parentFolder = path.dirname(destination);

    if (!existsSync(parentFolder)) {
      await promises.mkdir(parentFolder, { recursive: true });
    }
    // write the file
    await promises.writeFile(destination, Buffer.from(asset.data as unknown as ArrayBuffer));
  }
}