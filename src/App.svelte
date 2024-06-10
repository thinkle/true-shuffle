<script>
  import TrueShuffle from "./TrueShuffle.svelte";

  import { Hero, Page, Bar } from "contain-css-svelte";
  import "contain-css-svelte/themes/typography-airy.css";
  import "contain-css-svelte/vars/defaults.css";
  import "contain-css-svelte/vars/themes/purple.css";
  import { isLoggedIn } from "./authStore.js";
  import AuthButton from "./AuthButton.svelte";
  import UserInfo from "./UserInfo.svelte";
</script>

{#if !$isLoggedIn}
  <Hero>
    <AuthButton />
  </Hero>
{:else}
  <Page>
    <Bar slot="header" --bar-height="60px">
      <img src="/icon.webp" />

      <h1>True Shuffle</h1>
      <div style="width:100px">
        <AuthButton />
      </div>
    </Bar>
    <TrueShuffle></TrueShuffle>
    <Bar slot="footer">
      <div>
        By <a
          style="color:var(--fg-color);"
          href="https://tomhinkle.net"
          target="_blank">Tom Hinkle</a
        >
      </div>
      <UserInfo />
    </Bar>
  </Page>
{/if}

<style>
  img {
    object-fit: contain;
    height: 100%;
    border-radius: 50%;
  }
</style>
