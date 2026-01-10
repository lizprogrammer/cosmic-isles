import sdk from "@farcaster/frame-sdk";

let isInitialized = false;

export async function initFarcaster() {
  if (isInitialized) return;
  
  try {
    // Wait for SDK to be ready
    await sdk.actions.ready();
    isInitialized = true;
    
    console.log("Farcaster SDK ready!");
    
    // Get context
    const context = await sdk.context;
    console.log("Farcaster context:", context);
    
    return context;
  } catch (error) {
    console.error("Farcaster SDK error:", error);
    // Still mark as initialized to prevent retries
    isInitialized = true;
    return null;
  }
}
