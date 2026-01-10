import sdk from "@farcaster/frame-sdk";

export async function initFarcaster() {
  try {
    const context = await sdk.context;
    await sdk.actions.ready();
    return context;
  } catch (error) {
    console.error("Farcaster SDK error:", error);
    return null;
  }
}
