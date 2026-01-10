export async function callFarcasterReady() {
  try {
    if (typeof window === 'undefined') return false;
    
    // @ts-ignore
    if (window.sdk?.actions?.ready) {
      // @ts-ignore
      await window.sdk.actions.ready();
      return true;
    }
    
    const { default: sdk } = await import("@farcaster/frame-sdk");
    await sdk.actions.ready();
    return true;
  } catch (error) {
    console.error("Failed to call ready:", error);
    return false;
  }
}
