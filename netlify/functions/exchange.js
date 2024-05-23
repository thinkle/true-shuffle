export async function handler(event) {
  if (event.httpMethod !== "POST") {
    console.log("Method was ", event.httpMethod);
    return { statusCode: 405, body: "Method Not Allowed" };
  }
  const body = JSON.parse(event.body);
  const authCode = body.code; // Get the authorization code from the request
  const clientId = process.env.SPOTIFY_CLIENT_ID;
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;
  const redirectUri = process.env.url
    ? process.env.url.replace(/\/$/, "")
    : "http://localhost:8888";
  console.log("exchange uri is ", redirectUri);
  const base64credentials = Buffer.from(`${clientId}:${clientSecret}`).toString(
    "base64"
  );
  console.log("Got auth code", authCode);
  const response = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: `Basic ${base64credentials}`,
    },
    body: new URLSearchParams({
      grant_type: "authorization_code",
      code: authCode,
      redirect_uri: redirectUri,
    }),
  });

  const data = await response.json();
  console.log("Exchanged code for token!", data);
  return {
    statusCode: 200,
    body: JSON.stringify({
      access_token: data.access_token,
      refresh_token: data.refresh_token,
      expires_in: data.expires_in,
      scope: data.scope,
    }),
  };
}
