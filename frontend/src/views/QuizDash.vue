<template>
	<center>
		{{answerData}}
	</center>
</template>

<script <script lang="ts">
	import * as jajax from "@/jajax";
	import Vue from "vue";
	export default Vue.extend({
		data: function(){
			return {
				answerData: {},
			};
		},
		mounted() {
			this.$nextTick(function() {
				const apiURL = this.$store.state.api_url + "/api/answer/list";
				jajax.getJSON(apiURL, this.$store.state.jwtToken).then((data: any) => {
					this.answerData = data;
				}).catch(([xhrStatus]) => {
					console.log(xhrStatus);
				});
			});
		},
	});
</script>
