<!-- src/PlaylistFetcher.svelte -->
<script>
  import { fetchWithAuth } from "./utils.js";
  import Playlist from "./Playlist.svelte";
  import { writable } from "svelte/store";
  import { Button, FormItem, Bar } from "contain-css-svelte";
  export let onPlaylistsFetched = (p) => console.log("fetched", p);
  export let onPlaylistShuffled = (p) => console.log("shuffled", p);

  let playlists = writable([]);

  const getPlaylists = async () => {
    let items = [];
    const response = await fetchWithAuth(
      "https://api.spotify.com/v1/me/playlists"
    );

    if (response.ok) {
      let data = await response.json();
      items = [...items, ...data.items];
      while (data.total > items.length && data.next) {
        console.log(
          "Got ",
          items.length,
          "of",
          data.total,
          "... fetching more"
        );
        const nextResponse = await fetchWithAuth(data.next);
        if (nextResponse.ok) {
          data = await nextResponse.json();
          items = [...items, ...data.items];
        } else {
          console.log(
            "Failed to fetch all playlists:",
            nextResponse.status,
            nextResponse.statusText
          );
          break;
        }
      }
      playlists.set(items);
      onPlaylistsFetched(items);
    } else {
      console.log(
        "Failed to fetch playlists:",
        response.status,
        response.statusText
      );
    }
    console.log("Fetched items", items);
  };
  let filterText = "";
</script>

<Button on:click={getPlaylists}>Fetch All Playlists</Button>

<div style:--bar-bg="#fff7" style:--bar-fg="#333">
  {#if $playlists.length > 0}
    <Bar>
      <div>
        {#if filterText}
          Showing {$playlists.filter((p) =>
            p.name.toLowerCase().includes(filterText.toLowerCase())
          ).length} of
        {/if}
        {$playlists.length} playlists
      </div>
      <FormItem>
        <span slot="label">Search:</span>
        <input bind:value={filterText} placeholder="Filter playlists" />
      </FormItem>
    </Bar>
    <table
      class="playlist-container"
      style:--card-width="150px"
      style:--card-header-height="3em"
    >
      {#each $playlists as playlist (playlist.id)}
        {#if !filterText || playlist.name
            .toLowerCase()
            .includes(filterText.toLowerCase())}
          <Playlist {playlist} onShuffle={onPlaylistShuffled} />
        {/if}
      {/each}
    </table>
  {/if}
</div>

<style>
  table {
    margin: auto;
  }
</style>
