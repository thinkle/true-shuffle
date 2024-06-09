<!-- src/Playlist.svelte -->
<script>
  import { Card, Bar, Button, MiniButton } from "contain-css-svelte";
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
  let shuffled;
  let shuffling;

  async function doShuffle() {
    shuffling = true;
    shuffle(tracks);
    console.log("Shuffled Tracks: ", tracks);
    const success = await overwriteTracks(
      playlist.id,
      tracks.map((t) => t.track.uri)
    );
    if (success) {
      console.log("Did overwrite!");
      onShuffle(playlist);
      shuffled = true;
      shuffling = false;
    } else {
      console.log("Failed to overwrite tracks.");
      window.alert(
        "Failed to overwrite tracks... Maybe make a copy and try shuffling that?"
      );
      shuffling = false;
    }
  }
  let showLocalMode = false;
  let confirmationText = "";
  let bgImage = "";
  $: if (playlist && playlist.images && playlist.images.length > 0) {
    bgImage = `url(${playlist.images[0].url})`;
  }
</script>

<tr style:--bg-image={bgImage}>
  <td class="icon"></td>

  <td class="title">
    {#if !playlist}
      <h3>No playlist</h3>
    {:else}
      <h3 on:click={() => console.log(playlist)}>{playlist.name}</h3>
    {/if}
  </td>
  <td class="track-count">
    <span>{playlist.tracks.total} tracks</span>
  </td>
  <td class="jump">
    <a href={playlist.external_urls.spotify} target="_blank">Open in Spotify</a>
  </td>
  <td class="action">
    {#if playlist}
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
            Playlist includes
            {localTracks.length} local tracks which will be lost if we shuffle (the
            Spotify API does NOT support local tracks).
          </p>

          <label>
            Type "LOSE LOCAL TRACKS" to shuffle anyway.
            <input bind:value={confirmationText} />
          </label>
          {#if confirmationText === "LOSE LOCAL TRACKS"}
            <button on:click={doShuffle}>Shuffle Playlist</button>
          {/if}
        {:else if shuffled}
          Shuffled!
          <MiniButton on:click={() => (shuffled = false)}>&times;</MiniButton>
        {:else if shuffling}
          <p>Shuffling...</p>
        {:else}
          <Button on:click={doShuffle}>Shuffle {tracks.length} songs</Button>
        {/if}
      {/if}
    {/if}
  </td>
</tr>

<style>
  .title {
    padding-left: 2em;
  }
  td {
    padding-top: 4px;
    padding-bottom: 4px;
    border-top: 1px solid #0007;
  }
  .icon {
    width: 100px;
    height: 100px;
    background-image: var(--bg-image);
    background-size: contain;
    background-position: center;
    background-repeat: no-repeat;
  }
  main {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    position: relative;
    background-image: var(--bg-image);
    background-size: contain;
    background-position: center;
    background-repeat: no-repeat;
    width: 100%;
    height: 100%;
  }
</style>
