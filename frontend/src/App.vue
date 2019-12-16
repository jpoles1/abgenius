<template>
	<v-app dark>
		<Header/>
		<v-content style="margin-top: 6px;">
			<router-view></router-view>
		</v-content>
		<Footer/>
	</v-app>
</template>

<script lang="ts">
	import * as Sentry from "@sentry/browser";
	const productionMode = window.location.host === "abg.jpoles1.com";
	const prodDSN = "https://9a2fdf7aafe74d0ab96d31291a4e80e6@sentry.jpoles1.com/10";
	const devDSN = "https://9a2fdf7aafe74d0ab96d31291a4e80e6@sentry.jpoles1.com/10";
	Sentry.init({
		dsn: productionMode ? prodDSN : devDSN,
		environment: productionMode ? "prod" : "dev",
	});
	import Header from "@/components/Header.vue";
	import Footer from "@/components/Footer.vue";
	import Vue from "vue";
	export default Vue.extend({
		name: "App",
		components: {
			Header,
			Footer,
		},
		mounted() {
			if (window.location.host === "127.0.0.1:8080") {
				this.$store.commit("setLocalAPI");
			}
			if (this.$store.state.jwtClaims.email) {
				Sentry.configureScope((scope) => {
					scope.setUser({
						id: this.$store.state.jwtClaims.email,
						username: this.$store.state.jwtClaims.pid,
						email: this.$store.state.jwtClaims.email,
					});
				});
			}
		},
	});
</script>

<style>
	.flex-break {
		width: 100%;
		content: '';
		margin: 20px 0;
	}
</style>
