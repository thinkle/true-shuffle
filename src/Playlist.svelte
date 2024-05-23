<!-- src/Playlist.svelte -->
<script>
  import { Card, Bar, Button } from "contain-css-svelte";
  import { getTracks, overwriteTracks } from "./tracks.js";
  import { shuffle } from "./utils.js";

  export let playlist;
  export let onShuffle;

  let tracks;
  let fetchingTracks = false;
  let hasLocal = false;

  const fetchTracks = async () => {
    fetchingTracks = true;
    tracks = await getTracks(playlist.id);
    hasLocal = tracks.some((t) => t.track.uri.startsWith("spotify:local"));
  };

  async function doShuffle() {
    shuffle(tracks);
    console.log("Shuffled Tracks: ", tracks);
    const success = await overwriteTracks(
      playlist.id,
      tracks.map((t) => t.track.uri)
    );
    if (success) {
      console.log("Did overwrite!");
      onShuffle(playlist);
    } else {
      console.log("Failed to overwrite tracks.");
    }
  }
  let showLocalMode = false;
  let confirmationText = "";
</script>

<Card class="playlist" interactive>
  <div slot="header">
    {#if !playlist}
      <h3>No playlist</h3>
    {:else}
      <h3>{playlist.name}</h3>
    {/if}
  </div>
  <main>
    {#if playlist}
      <span>{playlist.tracks.total} tracks</span>
      {#if playlist.images && playlist.images.length > 0}
        <img width="150px" src={playlist.images[0].url} alt={playlist.name} />
      {/if}

      {#if !tracks}
        {#if !fetchingTracks}
          <Button on:click={fetchTracks}>Shuffle Playlist</Button>
        {:else}
          Fetching tracks...
        {/if}
      {:else if tracks}
        {#if hasLocal}
          {@const localTracks = tracks.filter((t) =>
            t.track.uri.startsWith("spotify:local")
          )}
          <p>
            Playlist includes <a
              href="#"
              on:click={() => (showLocalMode = !showLocalMode)}
              >{localTracks.length} local tracks</a
            >
            which will be lost if we shuffle (the Spotify API does NOT support local
            tracks).
          </p>
          {#if showLocalMode}
            <ul>
              {#each localTracks as { track }}
                <li>{track.track.name} by {track.track.artists[0].name}</li>
              {/each}
            </ul>
          {/if}
          <label>
            Type "LOSE LOCAL TRACKS" to shuffle anyway.
            <input bind:value={confirmationText} />
          </label>
          {#if confirmationText === "LOSE LOCAL TRACKS"}
            <button on:click={doShuffle}>Shuffle Playlist</button>
          {/if}
        {:else}
          <Button on:click={doShuffle}>Shuffle {tracks.length} songs</Button>
        {/if}
      {/if}
      <hr />
    {/if}
  </main>
</Card>

<style>
  main {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
  }
</style>
