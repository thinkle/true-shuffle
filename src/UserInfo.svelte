<script>
  import { userInfo } from "./authStore.js";
</script>

{#if $userInfo}
  <div>
    <p>Logged in as: {$userInfo.display_name}</p>
    <img src={$userInfo.images[0]?.url} alt="User Image" />
  </div>
{/if}

<style>
  img {
    max-height: 100%;
    border-radius: 50%;
  }
  div {
    display: flex;
    gap: var(--padding);
  }
</style>
