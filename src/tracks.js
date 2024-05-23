// src/tracks.js
import { fetchWithAuth } from "./utils.js";

export async function getTracks(playlistId) {
  let tracks = [];
  let nextUrl = `https://api.spotify.com/v1/playlists/${playlistId}/tracks?limit=100`;

  while (nextUrl) {
    const response = await fetchWithAuth(nextUrl);
    if (response.ok) {
      const data = await response.json();
      tracks = [...tracks, ...data.items];
      nextUrl = data.next;
    } else {
      console.log(
        "Failed to fetch tracks:",
        response.status,
        response.statusText
      );
      return null;
    }
  }

  return tracks;
}

export async function overwriteTracks(id, trackUris) {
  let origLength = trackUris.length;
  trackUris = trackUris.filter((u) => !u.startsWith("spotify:local"));
  console.log(`Filtered out ${origLength - trackUris.length} local tracks`);

  const batches = [];
  while (trackUris.length) {
    batches.push(trackUris.splice(0, 100));
  }

  let response = await fetchWithAuth(
    `https://api.spotify.com/v1/playlists/${id}/tracks`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        range_start: 0,
        uris: batches.shift(),
      }),
    }
  );

  if (!response.ok) {
    console.log(
      "Failed to replace tracks:",
      response.status,
      response.statusText
    );
    return false;
  }

  for (let batch of batches) {
    response = await fetchWithAuth(
      `https://api.spotify.com/v1/playlists/${id}/tracks`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ uris: batch }),
      }
    );

    if (!response.ok) {
      console.log(
        "Failed to add tracks:",
        response.status,
        response.statusText
      );
      return false;
    }
  }

  return true;
}
