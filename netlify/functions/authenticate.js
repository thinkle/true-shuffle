export async function handler(event, context) {
  const clientId = process.env.SPOTIFY_CLIENT_ID;
  const redirectUri = process.env.URL;
  console.log("auth redirect url is ", redirectUri);
  const scopes = encodeURIComponent(
    "playlist-read-private playlist-modify-private"
  );
  const url = `https://accounts.spotify.com/authorize?response_type=code&client_id=${clientId}&scope=${scopes}&redirect_uri=${redirectUri}`;
  console.log("Got me a URL ", url);
  console.log("Redirecting to spotify for authentication");
  return {
    statusCode: 302,
    headers: {
      Location: url,
    },
    body: JSON.stringify({
      message: "Redirecting to Spotify for authentication.",
    }),
  };
}
