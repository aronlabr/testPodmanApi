import * as extensionApi from '@podman-desktop/api';

export interface WSLInstance {
  name: string;
  state: string;
  version: number;
}

// Run the WSL command to list distributions with verbose info
export async function getDistros(): Promise<WSLInstance[]> {
  const { stdout } = await extensionApi.process.exec('wsl', ['-l', '-v'])

  // Split the output into lines and parse each distro
  const lines = stdout.trim().split('\n');
  // Remove header line
  lines.shift();

  // Process each line and create JSON object for each WSL distro
  const distros: WSLInstance[] = lines.map(line => {
    // Use regex to match the first column (name), second (state), and third (version)
    line = line.replace(/\u0000/g, '')
    const columns = line.trim().split(/\s{2,}/)
    if (!columns) console.log(`Invalid line format: ${line}`)
    else console.log(`Cols: ${JSON.stringify(columns, null, 2)}`)
    const [name, state, version] = columns ? columns : ['','','',''];
    return { name, state, version: parseInt(version) };
    
  });

  // Output the JSON
  console.log(JSON.stringify(distros, null, 2));
  return distros
}

export async function listWSLDistros(): Promise<void> {

}