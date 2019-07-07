<template>
	<center>
		<learning-curve :answer-data="answerData"/>
	</center>
</template>

<script <script lang="ts">
	import * as jajax from "@/jajax";
	import LearningCurve from "@/components/LearningCurve.vue";
	import Vue from "vue";
	export default Vue.extend({
		components: {
			LearningCurve,
		},
		data() {
			return {
				answerData: [],
			};
		},
		mounted() {
			this.$nextTick(function() {
				const apiURL = this.$store.state.api_url + "/api/answer/list";
				jajax.getJSON(apiURL, this.$store.state.jwtToken).then((data: any) => {
					this.answerData = data;
				}).catch((err) => {
					this.$toast(`Failed to fetch answer data (Err Code: ${err.respCode})`, {color: "#d98303"});
				});
			});
		},
	});
</script>
