export async function sleep(ms: number): Promise<void> {
  await new Promise((res) => setTimeout(res, ms));
}
