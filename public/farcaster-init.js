import { sdk } from 'https://esm.sh/@farcaster/frame-sdk';

(async () => {
  try {
    await sdk.actions.ready();
    console.log('✅ Farcaster SDK ready called!');
    window.farcasterReady = true;
  } catch (error) {
    console.error('❌ SDK ready error:', error);
  }
})();
