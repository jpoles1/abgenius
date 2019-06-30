<template>
    <center>
        <v-sheet class="login-box" elevation=4 style="margin-top: 160px;">
            <a :href="$store.state.api_url + '/api/auth/google'">
                <img src="/img/google_login.png" />
            </a>
        </v-sheet>
    </center>
</template>

<script lang="ts">
	import Vue from "vue";
	export default Vue.extend({
	});
</script>

<style scoped>
    .login-box {
        min-width: 240px;
		min-height: 120px;
		max-width: 33%;
		padding: 12px 18px;
		display: flex;
		align-items: center;
		justify-content: center;
		flex-wrap: wrap;
		margin: 12px;
		border-radius: 5px;
    }
</style>
