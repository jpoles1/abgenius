<template>
	<div>
		<headful
			title="ABGenius - Logging In"
		/>
		<center>
			<v-sheet class="login-box" elevation=4 style="margin-top: 160px;">
				<h2>Logging in...</h2>
				<br class="flex-break">
				<v-progress-circular
				:size="50"
				color="primary"
				indeterminate
				></v-progress-circular>
				<!--<md-empty-state
					v-if="serverError != undefined"
					md-icon="error"
					:md-label="'Server Error: ' + serverError" 
					md-description="Failed to login, redirecting...">
				</md-empty-state>-->
			</v-sheet>
		</center>
	</div>
</template>

<script lang="ts">
	import * as jajax from "@/jajax";
	import * as Sentry from "@sentry/browser";

	import Vue from "vue";
	export default Vue.extend({
		props: {
			provider: {
				type: String,
			},
		},
		data() {
			return {
				serverError: undefined,
			};
		},
		mounted() {
			this.$nextTick(function() {
				const urlParams = this.$route.query;
				let url = "";
				if (this.provider === "cas") {
					if (!urlParams.ticket) {
						window.location.href = this.$store.state.api_url + "/api/auth/" + this.provider;
						return;
					}
					url = this.$store.state.api_url + "/api/auth/" + this.provider + "/callback";
					url += "?ticket=" + encodeURIComponent(urlParams.ticket as string);
					if (urlParams.source) {
						url += "&source=" + urlParams.source;
					}
				} else {
					if (!(urlParams.state && urlParams.code)) {
						window.location.href = this.$store.state.api_url + "/api/auth/" + this.provider;
						return;
					}
					url = this.$store.state.api_url + "/api/auth/" + this.provider + "/callback";
					url += "?state=" + encodeURIComponent(urlParams.state as string);
					url += "&code=" + encodeURIComponent(urlParams.code as string);
				}
				jajax.getJSON(url, undefined).then((data: any) => {
					this.$store.commit("setJWTToken", data.token);
					// Update user in vue
					Sentry.configureScope((scope) => {
						scope.setUser({
							id: this.$store.state.jwtClaims.email,
							username: this.$store.state.jwtClaims.pid,
							email: this.$store.state.jwtClaims.email,
						});
					});
					// Redirect after login
					if (urlParams.source) {
						const authSource = (urlParams.source as string).replace(/~~/g, "?").replace(/~/g, "&");
						window.location.href = authSource;
					} else {
						window.location.href = "/";
					}
				}).catch(([xhrStatus]) => {
					this.serverError = xhrStatus;
					setTimeout(() => {
						window.location.href = this.$store.state.api_url + "/api/auth/" + this.provider;
					}, 1500);
				});
			});
		},
	});
</script>

<style scoped>
    .login-box {
        min-width: 240px;
		min-height: 120px;
		max-width: 33%;
		padding: 22px 18px;
		display: flex;
		align-items: center;
		justify-content: center;
		flex-wrap: wrap;
		margin: 12px;
		border-radius: 5px;
    }
</style>