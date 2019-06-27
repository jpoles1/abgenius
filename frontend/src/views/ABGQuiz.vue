<template>
	<v-container>
		<div>
			<center><h2>Arterial Blood Gas</h2></center><br>
			<v-layout text-xs-center wrap justify-center>
				<v-tooltip top>
					<template v-slot:activator="{ on }">
						<div v-on="on">
							<v-text-field readonly
								v-model.number="genBloodGas.abg.pH" 
								type="number" label='Serum pH'
								outline class="numeric-input" step="0.01"
								min="6" max="14"
							></v-text-field>
						</div>
					</template>
					<span>
						Ref Range: {{"(" + refRngs.apH.lower + " - " + refRngs.apH.upper + ")"}}
					</span>
				</v-tooltip>
				<v-tooltip top>
					<template v-slot:activator="{ on }">
						<div v-on="on">
							<v-text-field readonly
								v-model.number="genBloodGas.abg.bicarb" 
								type="number" label='Serum Bicarb'
								outline class="numeric-input" step="0.5"
								min="0"
							></v-text-field>
						</div>
					</template>
					<span>
						Ref Range: {{"(" + refRngs.aBicarb.lower + " - " + refRngs.aBicarb.upper + ")"}}
					</span>
				</v-tooltip>
				<v-tooltip top>
					<template v-slot:activator="{ on }">
						<div v-on="on">
							<v-text-field readonly
								v-model.number="genBloodGas.abg.PaCO2" 
								type="number" label='PaCO2'
								outline class="numeric-input" step="0.5"
								min="0"
							></v-text-field>
						</div>
					</template>
					<span>
						Ref Range: {{"(" + refRngs.PaCO2.lower + " - " + refRngs.PaCO2.upper + ")"}}
					</span>
				</v-tooltip>
			</v-layout>
			<center><h2>Electrolytes</h2></center><br>
			<v-layout text-xs-center wrap justify-center>
				 <v-tooltip top>
					<template v-slot:activator="{ on }">
						<div v-on="on">
							<v-text-field readonly
								v-model.number="genBloodGas.abg.Na" 
								type="number" label='Serum Sodium'
								outline class="numeric-input" step="0.5"
								min="0"
							></v-text-field>
						</div>
					</template>
					<span>
						Ref Range: {{"(" + refRngs.Na.lower + " - " + refRngs.Na.upper + ")"}}
					</span>
				</v-tooltip>
				<v-tooltip top>
					<template v-slot:activator="{ on }">
						<div v-on="on">
							<v-text-field readonly
								v-model.number="genBloodGas.abg.Cl" 
								type="number" label='Serum Chloride'
								outline class="numeric-input" step="0.5"
								min="0"
							></v-text-field>
						</div>
					</template>
					<span>
						Ref Range: {{"(" + refRngs.Cl.lower + " - " + refRngs.Cl.upper + ")"}}
					</span>
				</v-tooltip>
			</v-layout>
		</div>
		<hr>
		<center>
			<v-btn color="blue-grey darken-3" @click="showGaps=true" v-show="!showGaps">
				<i>Peek at Gap Calculations</i>
			</v-btn>
			<div v-if="showGaps" style="display: flex; justify-content: center;">
				<v-chip>
					<v-avatar class="error" v-if="genBloodGas.serumAnionGap().disturb == 'Anion Gap'">        
						<v-icon>fas fa-arrows-alt-h</v-icon>
					</v-avatar>
					<v-avatar class="success" v-if="genBloodGas.serumAnionGap().disturb == 'Normal'">        
						<v-icon small>fas fa-check</v-icon>
					</v-avatar>
					<b>Anion Gap:</b>&nbsp; {{genBloodGas.serumAnionGap().gap.toFixed(1)}}
				</v-chip>
				<div style="width: 20px"></div>
				<v-chip>
					<v-avatar class="error" v-if="genBloodGas.serumDeltaGap().disturb == 'Delta Gap'">        
						<v-icon>fas fa-arrows-alt-h</v-icon>
					</v-avatar>
					<v-avatar class="success" v-if="genBloodGas.serumDeltaGap().disturb == 'Normal'">        
						<v-icon small>fas fa-check</v-icon>
					</v-avatar>
					<b>Delta Gap:</b>&nbsp; {{genBloodGas.serumDeltaGap().gap.toFixed(1)}}
				</v-chip>
			</div>
		</center>
		<hr>
		<div id="answer-container" v-if="!answerSumitted">
			<center>
				<h2>Interpret this ABG (click to add):</h2>
				<br>
				<div v-if="addableDisturb.length > 0">
					<v-btn round v-for="(disturb, disturbIndex) in addableDisturb" :key="disturbIndex" @click="addDisturb(disturb)">	
						<v-icon small v-if='["Respiratory Acidosis", "Respiratory Alkalosis"].includes(disturb)'>
							fa-wind
						</v-icon>
						<v-icon small v-else-if='["Metabolic Acidosis", "Metabolic Alkalosis"].includes(disturb)'>
							fa-vial
						</v-icon>
						<div style="margin: 0 12px;">
							{{disturb}}
						</div>
					</v-btn>
					<br><br>
				</div>
				<div v-else style="margin-bottom: 20px;">
					<i>No additional disturbances to add.</i>
				</div>
			</center>
			<hr>
			<div style="display: flex; justify-content: space-around; text-align: center; flex-wrap: wrap;">
				<v-sheet v-for="(disturb, disturbIndex) in learnerAnswer" :key="disturbIndex" 
				class="answer-disturb-box" elevation=4>
					<div :style="{'margin-right': disturb[0] == 'Metabolic Acidosis' ? '20px' : '0'}"> 
						<b>{{disturb[0]}}</b>
						<br>
						<div v-if="disturb[0] == 'Metabolic Acidosis'">
							<v-radio-group v-model="disturb[1]">
								<v-radio
									label="Hyperchloremic"
									value="Hyperchloremic"
								></v-radio>
								<v-radio
									label="Anion Gap"
									value="Anion Gap"
								></v-radio>
							</v-radio-group>
						</div>
					</div>
					<v-btn @click="deleteDisturb(disturbIndex)" fab small color="red" style="transform: scale(0.8); position: absolute; top: 2px; right: 2px;">
						<v-icon>fas fa-trash-alt</v-icon>
					</v-btn>
				</v-sheet>
				<v-sheet class="answer-disturb-box" elevation=4 v-if="learnerAnswer.length === 0">
					<div>
						<b>Normal ABG</b>
						<br>
						<i>(Add an Acid-Base Disturbance)</i>
					</div>
				</v-sheet>
			</div>
			<hr>
			<center>
				<v-btn @click="submitAnswer" color="blue">
					Submit Answer
				</v-btn>
			</center>
		</div>
		<div v-else style="display: flex; justify-content: center; flex-wrap: wrap;">
			<center>
				<b>Genius Answer:</b>
				<br>
				<v-chip v-for="(disturb, disturbIndex) in geniusAnswer" :key="disturbIndex">
					<v-avatar class="warning" v-if='!["Normal", "Unknown"].includes(disturb[0])'>
						<v-icon small v-if='["Respiratory Acidosis", "Respiratory Alkalosis"].includes(disturb[0])'>
							fa-wind
						</v-icon>
						<v-icon small v-else-if='["Metabolic Acidosis", "Metabolic Alkalosis"].includes(disturb[0])'>
							fa-vial
						</v-icon>
					</v-avatar>
					<v-avatar class="success" v-if="disturb[0] == 'Normal'">        
						<v-icon small>fas fa-check</v-icon>
					</v-avatar>
					<div v-if="disturb[0] == 'Normal'">
						No Acid Base Disorder
					</div>
					<div v-else>
						{{disturb[1]}} {{disturb[0]}}
					</div>
				</v-chip>
			</center>
			<br class="flex-break">
			<center>
				<b>Your Answer (in {{timeElapsed}} sec):</b>
				<br>
				<v-chip v-for="(disturb, disturbIndex) in learnerAnswer" :key="disturbIndex">
					<v-avatar class="warning" v-if='!["Normal", "Unknown"].includes(disturb[0])'>
						<v-icon small v-if='["Respiratory Acidosis", "Respiratory Alkalosis"].includes(disturb[0])'>
							fa-wind
						</v-icon>
						<v-icon small v-else-if='["Metabolic Acidosis", "Metabolic Alkalosis"].includes(disturb[0])'>
							fa-vial
						</v-icon>
					</v-avatar>
					<v-avatar class="success" v-if="disturb[0] == 'Normal'">        
						<v-icon small>fas fa-check</v-icon>
					</v-avatar>
					<div v-if="disturb[0] == 'Normal'">
						No Acid Base Disorder
					</div>
					<div v-else>
						{{disturb[1]}} {{disturb[0]}}
					</div>
				</v-chip>
			</center>
			<br class="flex-break">
			<v-btn color="primary" @click="nextABG">
				Next ABG
			</v-btn>
		</div>
	</v-container>
</template>

<script lang="ts">
	const flatten = <T extends {}>(arr: T[][]): T[] => {
		return  [].concat(...arr as any);
	};
	
	import * as BG from "@/components/BloodGas";
	import { abgGenerators, generateRandABG } from "@/components/BloodGasGen";

	import BrowserInteractionTime from "browser-interaction-time";
	const BIT = new BrowserInteractionTime({
		timeIntervalEllapsedCallbacks: [],
		absoluteTimeEllapsedCallbacks: [],
		browserTabInactiveCallbacks: [],
		browserTabActiveCallbacks: [],
		idleTimeoutMs: 60 * 1000,
		checkCallbacksIntervalMs: 250,
	});

	import Vue from "vue";
	export default Vue.extend({
		data() {
			return {
				timeElapsed: undefined as number | undefined,
				showGaps: false,
				answerSumitted: false,
				disturbToAdd: undefined as BG.DisturbType | undefined,
				refRngs: BG.RefRngs,
				genBloodGas: new BG.BloodGas({
					abg: {
						pH: BG.RefRngMidpoint("apH"),
						bicarb: BG.RefRngMidpoint("aBicarb"),
						PaCO2: BG.RefRngMidpoint("PaCO2"),
						PaO2: BG.RefRngMidpoint("PaO2"),
						Na: BG.RefRngMidpoint("Na"),
						K: BG.RefRngMidpoint("K"),
						Cl: BG.RefRngMidpoint("Cl"),
					},
				}),
				answerInput: [] as Array<Map<BG.DisturbType, boolean>>,
				learnerAnswer: [] as BG.DisturbType[][],
				geniusAnswer: [] as BG.DisturbType[][],
			};
		},
		methods: {
			addDisturb(disturbToAdd: BG.DisturbType | undefined) {
				disturbToAdd = disturbToAdd || this.disturbToAdd;
				if (disturbToAdd === undefined) return;
				if (disturbToAdd === BG.DisturbType.MetAcid) {
					this.learnerAnswer.push([disturbToAdd!, BG.DisturbType.Hyperchloremic]);
				} else {
					this.learnerAnswer.push([disturbToAdd!]);
				}
				this.disturbToAdd = undefined;
			},
			deleteDisturb(disturbIndex: number) {
				this.learnerAnswer.splice(disturbIndex, 1);
			},
			submitAnswer() {
				this.answerSumitted = true;
				BIT.stopTimer();
				this.timeElapsed = Math.round(BIT.getTimeInMilliseconds() / 1000);
				if (this.learnerAnswer.length === 0) {
					this.learnerAnswer = [[BG.DisturbType.Normal]];
				}
				const answerData = {
					learner: this.learnerAnswer,
					genius: this.geniusAnswer,
					timeElapsed: this.timeElapsed,
					peekedAtGaps: this.showGaps,
				};
			},
			nextABG() {
				const randomGen = Object.keys(abgGenerators)[Math.floor(Math.random() * Object.keys(abgGenerators).length)];
				this.answerSumitted = false;
				this.showGaps = false;
				[this.genBloodGas, this.geniusAnswer] = abgGenerators[randomGen]();
				this.learnerAnswer = [];
				BIT.reset();
				BIT.startTimer();
			},
		},
		computed: {
			addableDisturb(): BG.DisturbType[] {
				const primaryDisturb = [BG.DisturbType.MetAcid, BG.DisturbType.MetAlk, BG.DisturbType.RespAcid, BG.DisturbType.RespAlk];
				return primaryDisturb.filter((disturb) => {
					if (disturb === BG.DisturbType.MetAcid && this.learnerAnswer.filter((x) => x[0] === BG.DisturbType.MetAcid).length < 3) {
						return true;
					}
					if ([BG.DisturbType.RespAcid, BG.DisturbType.RespAlk].includes(disturb)) {
						return flatten(this.learnerAnswer).filter((x) => [BG.DisturbType.RespAcid, BG.DisturbType.RespAlk].includes(x)).length === 0;
					}
					return flatten(this.learnerAnswer).filter((x) => x === disturb).length === 0;
				});
			},
		},
		mounted() {
			this.$nextTick(function() {
				this.nextABG();
			});
		},
	});
</script>

<style>
	.flex-break {
		width: 100%;
		content: '';
		margin: 20px 0;
	}
	.answer-disturb-box {
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
