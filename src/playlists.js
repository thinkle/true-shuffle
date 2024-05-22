async function getPlaylists() {
  const token = localStorage.getItem("spotify_auth_token");
  let items = [];
  if (token) {
    const response = await fetch("https://api.spotify.com/v1/me/playlists", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (response.ok) {
      let data = await response.json();
      items = [...items, ...data.items];
      while (data.total > items.length) {
        const response = await fetch(data.next, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (response.ok) {
          data = await response.json();
          items = [...items, ...data.items];
        } else {
          console.log(
            "Failed to fetch playlists:",
            response.status,
            response.statusText
          );
          break;
        }
      }
      displayPlaylists(items);
    } else {
      console.log(
        "Failed to fetch playlists:",
        response.status,
        response.statusText
      );
    }
    console.log("Fetched items", items);
  } else {
    console.log("No auth token found");
  }
}

document.addEventListener("DOMContentLoaded", async function () {
  let button = document.createElement("button");
  button.textContent = "Get playlists!";
  button.addEventListener("click", getPlaylists);
  document.querySelector("#app").appendChild(button);
  console.log("playslists loaded");
});

async function getTracks(playlistId) {
  const token = localStorage.getItem("spotify_auth_token");
  let tracks = [];

  if (token) {
    let nextUrl = `https://api.spotify.com/v1/playlists/${playlistId}/tracks?limit=50`;

    while (nextUrl) {
      const response = await fetch(nextUrl, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

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
  } else {
    console.log("No auth token found");
    return null;
  }

  return tracks;
}

function shuffle(items) {
  for (let i = items.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [items[i], items[j]] = [items[j], items[i]];
  }
  return items;
}
async function overwriteTracks(id, trackUris) {
  let origLength = trackUris.length;
  trackUris = trackUris.filter((u) => !u.startsWith("spotify:local"));
  console.log(`Filtered out ${origLength - trackUris.length} local tracks`);
  const token = localStorage.getItem("spotify_auth_token");

  if (token) {
    const batches = [];

    while (trackUris.length) {
      batches.push(trackUris.splice(0, 50));
    }

    // Replace the playlist's items with the first batch
    let response = await fetch(
      `https://api.spotify.com/v1/playlists/${id}/tracks`,
      {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
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

    // Add any remaining batches
    for (let i = 0; i < batches.length; i++) {
      console.log("Adding batch: ", batches[i]);
      let response = await fetch(
        `https://api.spotify.com/v1/playlists/${id}/tracks`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            uris: batches[i],
          }),
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
  } else {
    console.log("No auth token found");
    return false;
  }
}

function displayPlaylists(items) {
  let playlistEl = document.querySelector("#playlists");
  if (!playlistEl) {
    playlistEl = document.createElement("div");
    playlistEl.id = "playlists";
    document.querySelector("#app").appendChild(playlistEl);
  }
  playlistEl.innerHTML = "";
  items.forEach((playlist) => {
    const playlistEl = document.createElement("div");
    playlistEl.innerHTML = `<h2>${playlist.name}</h2>
    <img src="${playlist.images[0].url}" alt="${playlist.name}" />
    <button>Shuffle Playlist</button>
    <hr>
    `;
    playlistEl.querySelector("button").addEventListener("click", async () => {
      let id = playlist.id;
      window.alert("Fetching tracks... be patient");
      let tracks = await getTracks(id);
      window.alert(`Got ${tracks.length} tracks`);

      shuffle(tracks);
      console.log("Shuffled Tracks: ", tracks);
      overwriteTracks(
        id,
        tracks.map((t) => t.track.uri)
      );
      console.log("Did overwrite!");
    });
    document.querySelector("#playlists").appendChild(playlistEl);
  });
}
