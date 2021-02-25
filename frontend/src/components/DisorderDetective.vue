<template>
	<center>
		<h2 style="margin-bottom: 12px;">Your Stats</h2>
		<div style="display: flex; flex-wrap:wrap; justify-content: center;">
			<div v-for="(confusion, disorder) in confusionDict" :key="disorder" style="border: 1px solid black; text-align: center; padding: 8px;">
				<b>{{disorder}}</b>
				<hr style="margin: 2px 0;">
				<div :style='{"background-color": percentageToColor(confusion.sensitivity())}' class="stat-div">
					Sensitivity: {{confusion.sensitivity().toFixed(2)}}
				</div>
				<div :style='{"background-color": percentageToColor(confusion.specificity())}' class="stat-div">
					Specificity: {{confusion.specificity().toFixed(2)}}
				</div>
				<div :style='{"background-color": percentageToColor(confusion.ppv())}' class="stat-div">
					PPV: {{confusion.ppv().toFixed(2)}}
				</div>
				<div :style='{"background-color": percentageToColor(confusion.npv())}' class="stat-div">
					NPV: {{confusion.npv().toFixed(2)}}
				</div>
			</div>
		</div>
		<div style="font-style: italic; margin-top: 15px;">
			Sensitivity: When the process was present how often did you detect it?
			<br>
			Specificity: When the process was not present how often did correctly exclude it?
			<br>
			PPV: When you said the process was present how often were you right?
			<br>
			NPV: When you said the process was not present how often were you right?
		</div>
	</center>
</template>

<script lang="ts">
	import * as BG from "@/components/BloodGas";
	import Vue from "vue";
	class Confusion2x2 {
		public TruePos = 0;
		public FalsePos = 0;
		public TrueNeg = 0;
		public FalseNeg = 0;
		public constructor(init?: Partial<Confusion2x2>) {
			Object.assign(this, init);
		}
		public sensitivity(): number {
			return (this.TruePos / Math.max(0.00001, this.TruePos + this.FalseNeg));
		}
		public specificity(): number {
			return (this.TrueNeg / Math.max(0.00001, this.TrueNeg + this.FalsePos));
		}
		public ppv(): number {
			return (this.TruePos / Math.max(0.00001, this.TruePos + this.FalsePos));
		}
		public npv(): number {
			return (this.TrueNeg / Math.max(0.00001, this.TrueNeg + this.FalseNeg));
		}
	}
	export default Vue.extend({
		props: {
			answerData: {
				type: Array as () => BG.ABGAnswer[],
			},
		},
		watch: {
			answerData() {
				this.runStats();
			},
		},
		mounted() {
			this.$nextTick(() => {
				this.runStats();
			});
		},
		data() {
			return{
				confusionDict: {} as {[disorder: string]: Confusion2x2},
			};
		},
		methods: {
			percentageToColor(percentage: number, maxHue = 120, minHue = 0) {
				const hue = percentage * (maxHue - minHue) + minHue;
				return `hsl(${hue}, 100%, 35%)`;
			},
			runStats() {
				const disorderList = [BG.DisturbType.Normal, BG.DisturbType.RespAcid, BG.DisturbType.RespAlk, BG.DisturbType.MetAlk, BG.DisturbType.MetAcid, BG.DisturbType.AnionGap, BG.DisturbType.IncompleteComp];
				this.confusionDict = {};
				// Add desired disorders to the dict
				disorderList.forEach((disorder) => {
					this.confusionDict[disorder] = new Confusion2x2();
				});
				// Iterate over answers
				this.answerData.forEach((answer) => {
					disorderList.forEach((disorder) => {
						if (answer.genius.indexOf(disorder) !== -1) {
							if (answer.learner.indexOf(disorder) !== -1) {
								this.confusionDict[disorder].TruePos += 1;
							} else {
								this.confusionDict[disorder].FalseNeg += 1;
							}
						} else if (answer.learner.indexOf(disorder) !== -1) {
							this.confusionDict[disorder].FalsePos += 1;
						} else {
							this.confusionDict[disorder].TrueNeg += 1;
						}
					});
				});
				Object.keys(this.confusionDict).forEach((disorder) => {
					const disorderConfusion = this.confusionDict[disorder];
				});
			},
		},
	});
</script>

<style scoped>
	.stat-div {
		border-radius: 4px;
		padding: 4px;
		margin: 4px 0;
		font-weight: bold;
		font-size: 85%;
	}
</style>