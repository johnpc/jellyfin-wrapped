const serverUrl = process.env.VITE_JELLYFIN_SERVER_URL;
const apiKey = process.env.VITE_JELLYFIN_API_KEY;

(async () => {
  // Check plugin status
  const res = await fetch(`${serverUrl}/Plugins`, {
    headers: { 'X-Emby-Token': apiKey }
  });
  const plugins = await res.json();
  const playback = plugins.find(p => p.Name === 'Playback Reporting');
  console.log('Playback Reporting status:', playback?.Status);
  
  // Test the query endpoint
  const r = await fetch(`${serverUrl}/user_usage_stats/submit_custom_query`, {
    method: 'POST',
    headers: {
      'X-Emby-Token': apiKey,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      CustomQueryString: 'SELECT * FROM PlaybackActivity LIMIT 1',
      ReplaceUserId: false,
    }),
  });
  
  console.log('Query endpoint status:', r.status);
  const text = await r.text();
  if (text) {
    console.log('Response:', text.substring(0, 300));
    try {
      const json = JSON.parse(text);
      console.log('✓ JSON parsed successfully');
      console.log('Keys:', Object.keys(json));
    } catch (e) {
      console.log('✗ Not valid JSON');
    }
  }
})();
