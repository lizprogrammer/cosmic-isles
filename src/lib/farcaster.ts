export async function initFarcaster() {
  try {
    // Wait for SDK to be available on window
    if (typeof window === 'undefined') return null;
    
    // @ts-ignore - SDK loaded via script tag
    const sdk = window.sdk || (await import("@farcaster/frame-sdk")).default;
    
    if (!sdk) {
      console.error("Farcaster SDK not found");
      return null;
    }
    
    // Signal ready to Farcaster
    await sdk.actions.ready();
    
    console.log("Farcaster SDK ready!");
    
    // Get context
    const context = await sdk.context;
    console.log("Farcaster context:", context);
    
    return context;
  } catch (error) {
    console.error("Farcaster SDK error:", error);
    return null;
  }
}
