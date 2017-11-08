export function isLocalDev(): boolean {
  return (!!process.env.DEV || process.env.STAGE === 'dev');
}
