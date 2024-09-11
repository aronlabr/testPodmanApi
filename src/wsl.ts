import { exec } from "child_process";
import * as extensionApi from '@podman-desktop/api';

// Run the WSL command to list distributions with verbose info
export async function getDistros(): Promise<void> {
  const { stderr, stdout } = await extensionApi.process.exec('wsl', ['-l', '-v'])

  if (stderr) {
    console.error(`Error in output: ${stderr}`);
    return;
  }

  // Split the output into lines and parse each distro
  const lines = stdout.trim().split('\n');
  // Remove header line
  lines.shift();

  // Process each line and create JSON object for each WSL distro
  const distros = lines.map(line => {
    const [name, state, version] = line.trim().split(/\s+/);
    return { name, state, version: parseInt(version) };
  });

  // Output the JSON
  console.log(JSON.stringify(distros, null, 2));
}

export async function listWSLDistros(): Promise<void> {

}