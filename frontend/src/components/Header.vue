<template>
	<v-toolbar app>
		<v-toolbar-title class="headline">
			<span>ABG</span>
			<span class="font-weight-light">enius</span>
		</v-toolbar-title>
		<v-spacer></v-spacer>
		<v-btn flat href="https://github.com/jpoles1/abgenius" target="_blank">
			<span class="mr-2">FAQ</span>
			<v-icon>fas fa-question-circle</v-icon>
		</v-btn>
		<v-btn flat href="/login" v-if="Object.keys($store.state.jwtClaims).length === 0">
			<span class="mr-2">Login</span>
			<v-icon>fas fa-key</v-icon>
		</v-btn>
		<v-btn flat href="/logout" v-else>
			<span class="mr-2">Logout</span>
			<v-icon>fas fa-door-open</v-icon>
		</v-btn>
		{{$store.state.jwtClaims.length}}
	</v-toolbar>
</template>

<script lang="ts">
	import Vue from "vue";
	export default Vue.extend({
	});
</script>
