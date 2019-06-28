<template>
	<div>
		<headful
			title="ABGenius - Logging Out"
		/>
		<center>
			<v-sheet class="login-box" elevation=4 style="margin-top: 160px;">
				<h2>Logging out...</h2>
				<br><br>
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
	import * as Sentry from "@sentry/browser";

	import Vue from "vue";
	export default Vue.extend({
		mounted() {
			this.$nextTick(function() {
				this.$store.commit("setJWTToken", undefined);
				Sentry.configureScope((scope) => {
					scope.setUser({});
				});
				window.location.href = "/";
			});
		},
	});
</script>