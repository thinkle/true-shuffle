<!-- src/components/AuthButton.svelte -->
<script>
  import { Button } from "contain-css-svelte";
  import UserInfo from "./UserInfo.svelte";

  import { onMount } from "svelte";
  import { isLoggedIn, userInfo, doLogin, logout } from "./authStore.js";

  let authenticated;

  $: authenticated = $isLoggedIn;

  const handleLogin = () => {
    window.location.href = "/.netlify/functions/authenticate";
  };

  const handleLogout = () => {
    logout();
  };

  onMount(async () => {
    const queryParams = new URLSearchParams(window.location.search);
    const code = queryParams.get("code");

    if (code) {
      await doLogin(code);
      history.pushState(null, "", location.href.split("?")[0]);
    }
  });
</script>

{#if authenticated}
  <Button on:click={handleLogout}>Logout from Spotify</Button>
{:else}
  <Button on:click={handleLogin} --button-bg="#1DB954" --button-fg="white"
    >Login to Spotify!</Button
  >
{/if}
