import sdk from 'https://cdn.jsdelivr.net/npm/@farcaster/frame-sdk@0.1.0/+esm';

(async () => {
  try {
    await sdk.actions.ready();
    console.log('✅ Farcaster SDK ready called!');
    window.farcasterReady = true;
  } catch (error) {
    console.error('❌ SDK ready error:', error);
    window.farcasterReady = false;
  }
})();
