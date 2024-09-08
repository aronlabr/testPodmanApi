declare module 'shell-path' {
  export const shellPath: () => Promise<string>;
  export const shellPathSync: () => string;
}