<template>
	<v-container>
		<headful
			title="ABGenius - Trainer"
		/>
		<div id="abg-data">
			<v-dialog v-model="instructionDialog" max-width="500" :fullscreen="$vuetify.breakpoint.smAndDown">
				<template v-slot:activator="{ on }">
					<v-btn color="primary" fab small dark v-on="on"
					style="position: absolute; right: 20px; top: 6px;">
						<v-icon>fa-question</v-icon>
					</v-btn>
				</template>
				<v-card>
					<div class="headline grey darken-2" style="text-align: center; padding: 12px;" primary-title>
						ABG Trainer Instructions
					</div>
					<v-card-text style="text-align: justify; padding: 16px 22px;">
						The ABGenius trainer allows you to hone your skills in arterial blood gas interpretation.
						Use this as a low stress environment, where you should feel free to make mistakes as long as you learn from them!
						Here's how you can get started:
						<ol class="instruction-list">
							<li>
								When you close this dialog, you will be presented with the results of a randomly selected ABG. 
								Inspect the values and try to decide what acid-base disturbances are indicated by this lab test.
							</li>
							<li>
								Scroll down to the section entitled "Interpret this ABG" and click on each of the acid-base disturbances which you believe are present.
							</li>
							<li>
								When you are ready, click "submit" and you will be able to see the ABGenius answer. Click on each acid-base disturbance in the correct answer to learn more.
							</li>
							<li>
								If you made a mistake, try and learn from it; if not, keep up the strong work! As you complete more questions you will be able to track your performance on the learning curve in your feedback panel.   
							</li>
						</ol>
					</v-card-text>
					<v-divider style="margin-bottom: 4px;"/>
					<v-card-actions>
						<v-spacer></v-spacer>
						<v-btn color="primary" @click="instructionDialog = false" style="margin-bottom: 4px; margin-right: 6px;">
							Continue
						</v-btn>
					</v-card-actions>
				</v-card>
			</v-dialog>

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
		<center v-if="!answerSumitted">
			<hr>
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
					<v-btn v-for="(disturb, disturbIndex) in addableDisturb" :key="disturbIndex" 
					@click="addDisturb(disturb); addedDisturb=true;"
					:class="{'add-disturb-btn': !addedDisturb, 'disturb-btn': true}" round>	
						<v-icon small v-if='["Respiratory Acidosis", "Respiratory Alkalosis"].includes(disturb[0])'>
							fa-wind
						</v-icon>
						<v-icon small v-else-if='["Metabolic Acidosis", "Metabolic Alkalosis"].includes(disturb[0])'>
							fa-vial
						</v-icon>
						<div style="margin: 0 12px; font-size: 90%">
							{{disturb[1]}} {{disturb[0]}}
						</div>
					</v-btn>
					<br><br>
				</div>
				<div v-else style="margin-bottom: 20px;">
					<i>No additional disturbances to add.</i>
				</div>
			</center>
			<hr>
			<div style="display: flex; justify-content: center; text-align: center; flex-wrap: wrap;">
				<!--<v-sheet v-for="(disturb, disturbIndex) in learnerAnswer" :key="disturbIndex" 
				class="answer-disturb-box" elevation=4>
					<div> 
						<b>{{disturb[1]}} {{disturb[0]}}</b>
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
				</v-sheet>-->
				<h2>Your Answer<span v-if="learnerAnswer.length > 0"> (click to remove)</span>:</h2>
				<div class="flex-break" style="margin: 10px;"/>
				<v-btn v-for="(disturb, disturbIndex) in learnerAnswer" :key="disturbIndex" 
				@click="deleteDisturb(disturb)" round class="disturb-btn">	
					<v-icon small v-if='["Respiratory Acidosis", "Respiratory Alkalosis"].includes(disturb[0])'>
						fa-wind
					</v-icon>
					<v-icon small v-else-if='["Metabolic Acidosis", "Metabolic Alkalosis"].includes(disturb[0])'>
						fa-vial
					</v-icon>
					<div style="margin: 0 12px; font-size: 90%">
						{{disturb[1]}} {{disturb[0]}}
					</div>
				</v-btn>
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
		<div v-else>
			<v-tabs centered color="cyan" dark icons-and-text id="feedback-tabs">
				<v-tabs-slider color="yellow"></v-tabs-slider>

				<v-tab href="#answer-tab" class="review-tab" 
				@click="goTo('#feedback-tabs', { 'offset': 20 })">
					Answer
					<v-icon>fa-stethoscope</v-icon>
				</v-tab>
				<v-tab href="#performance-tab" class="review-tab" v-if="answerData && answerData.length > 0"
				@click="goTo('#feedback-tabs', { 'offset': 20 })">
					Learning Curve
					<v-icon>fa-chart-line</v-icon>
				</v-tab>

				<v-tab-item value="answer-tab">
					<v-card flat>
						<v-card-text style="padding-top: 24px; display: flex; justify-content: center; flex-wrap: wrap;">
							<center>
								<v-sheet :color="percToColor(gradeAnswer)" class="score-box" elevation=4>
									Score: {{gradeAnswer}}%
								</v-sheet>
							</center>
							<div class="flex-break" style="margin: 10px;"/>
							<center>
								<b>Your Answer (took {{timeElapsed}} sec):</b>
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
							<div class="flex-break" style="margin: 10px;"/>
							<center id="info-chips">
								<b>Genius Answer (click for explanation):</b>
								<br>
								<v-chip v-for="(disturb, disturbIndex) in geniusAnswer" :key="disturbIndex"  
								@click="activateChipInfo(disturb[0])" :class="{'genius-disturb': disturb[0] !== 'Normal'}">
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
								<hr v-if="results.serumAnionGap.disturb === 'Anion Gap'">
								<v-chip class="genius-disturb" @click="activateChipInfo('anionGap')"
								v-if="results.serumAnionGap.disturb === 'Anion Gap'">
									<v-avatar class="error" v-if="genBloodGas.serumAnionGap().disturb == 'Anion Gap'">        
										<v-icon>fas fa-arrows-alt-h</v-icon>
									</v-avatar>
									<v-avatar class="success" v-if="genBloodGas.serumAnionGap().disturb == 'Normal'">        
										<v-icon small>fas fa-check</v-icon>
									</v-avatar>
									<b>Anion Gap:</b>&nbsp; {{genBloodGas.serumAnionGap().gap.toFixed(1)}}
								</v-chip>
								<v-chip class="genius-disturb" @click="activateChipInfo('deltaGap')"
								 v-if="results.serumAnionGap.disturb === 'Anion Gap'" >
									<v-avatar class="error" v-if="genBloodGas.serumDeltaGap().disturb == 'Delta Gap'">        
										<v-icon>fas fa-arrows-alt-h</v-icon>
									</v-avatar>
									<v-avatar class="success" v-if="genBloodGas.serumDeltaGap().disturb == 'Normal'">        
										<v-icon small>fas fa-check</v-icon>
									</v-avatar>
									<b>Delta Gap:</b>&nbsp; {{genBloodGas.serumDeltaGap().gap.toFixed(1)}}
								</v-chip>
							</center>
							<div class="flex-break" style="margin: 10px;"/>
							<transition name="infos" mode="out-in">
								<CalcInfoPanel id="genius-info-panel" v-if="activeChip !== undefined" :activeChip="activeChip" :abg="genBloodGas.abg" :results="results"/>
							</transition>
						</v-card-text>
					</v-card>
				</v-tab-item>
				<v-tab-item value="performance-tab">
					<v-card flat>
						<learning-curve :answer-data="answerData" :width="380" :height="260" style="margin: auto"/>
					</v-card>
				</v-tab-item>
			</v-tabs>
			<center style="margin-top: 6px;">
				<v-btn color="primary" @click="nextABG">
					Next ABG
				</v-btn>
			</center>
		</div>
	</v-container>
</template>

<script lang="ts">
	const flatten = <T extends {}>(arr: T[][]): T[] => {
		return  [].concat(...arr as any);
	};

	import { BloodGas, DisturbType, RefRngs, RefRngMidpoint, ABGAnswer } from "@/components/BloodGas";
	import { abgGenerators } from "@/components/BloodGasGen";
	import * as jajax from "@/jajax";
	import { arrayEq } from "@/util";
	import goTo from "vuetify/lib/components/Vuetify/goTo";

	import BrowserInteractionTime from "browser-interaction-time";
	const BIT = new BrowserInteractionTime({
		timeIntervalEllapsedCallbacks: [],
		absoluteTimeEllapsedCallbacks: [],
		browserTabInactiveCallbacks: [],
		browserTabActiveCallbacks: [],
		idleTimeoutMs: 60 * 1000,
		checkCallbacksIntervalMs: 250,
	});

	import CalcInfoPanel from "@/components/CalcInfoPanel.vue";
	import LearningCurve from "@/components/LearningCurve.vue";

	const generatorDisturbs = Object.entries(abgGenerators).reduce((agg, [genName, gen]) => {
		agg[JSON.stringify(gen(true)[1])] = genName;
		return agg;
	}, {} as {[disturbs: string]: string});

	import Vue from "vue";
	export default Vue.extend({
		components: {
			CalcInfoPanel,
			LearningCurve,
		},
		data() {
			return {
				instructionDialog: false,
				activeChip: undefined as string | undefined,
				addedDisturb: false,
				timeElapsed: undefined as number | undefined,
				showGaps: false,
				answerSumitted: false,
				answerData: [] as ABGAnswer[],
				disturbToAdd: undefined as DisturbType[] | undefined,
				refRngs: RefRngs,
				genBloodGas: new BloodGas({
					abg: {
						pH: RefRngMidpoint("apH"),
						bicarb: RefRngMidpoint("aBicarb"),
						PaCO2: RefRngMidpoint("PaCO2"),
						PaO2: RefRngMidpoint("PaO2"),
						Na: RefRngMidpoint("Na"),
						K: RefRngMidpoint("K"),
						Cl: RefRngMidpoint("Cl"),
					},
				}),
				answerInput: [] as Array<Map<DisturbType, boolean>>,
				learnerAnswer: [] as DisturbType[][],
				geniusAnswer: [] as DisturbType[][],
				goTo,
			};
		},
		methods: {
			addDisturb(disturbToAdd: DisturbType[] | undefined) {
				disturbToAdd = disturbToAdd || this.disturbToAdd;
				if (disturbToAdd === undefined) return;
				this.learnerAnswer.push(disturbToAdd!);
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
					this.learnerAnswer = [[DisturbType.Normal]];
				}
				const answerData = {
					learner: this.learnerAnswer,
					genius: this.geniusAnswer,
					grade: this.gradeAnswer,
					timeElapsed: this.timeElapsed,
					peekedAtGaps: this.showGaps,
				} as ABGAnswer;
				const url = this.$store.state.api_url + "/api/answer/submit";
				jajax.postJSON(url, answerData, this.$store.state.jwtToken).then((data: any) => {
					this.answerData.push(answerData);
					this.$toast("Progress saved!");
					goTo("#feedback-tabs", { offset: 20 });
				}).catch((err) => {
					this.$toast(`Failed to save response (Err Code: ${err.respCode})`, {color: "#d98303"});
				});
			},
			loadAnswerData(): Promise<any> {
				const apiURL = this.$store.state.api_url + "/api/answer/list";
				return jajax.getJSON(apiURL, this.$store.state.jwtToken).then((data: any) => {
					this.answerData = (data || []).reverse();
					// If the user has not yet answered any questions, show them the instructions
					if (this.answerData.length < 1) {
						this.instructionDialog = true;
					}
				}).catch((err) => {
					this.$toast(`Failed to fetch answer data (Err Code: ${err.respCode})`, {color: "#d98303"});
				});
			},
			selectNewGenerator(): string {
				// We first construct an Object with a key for each generator name, and a zero initial count.
				const startObj = Object.keys(abgGenerators).reduce((agg, genName) => {
					agg[genName] = 0;
					return agg;
				}, {} as {[q: string]: number});
				// Now we count up the generators used in the questions already answered by the user.
				const genCounts = this.answerData.reduce((agg, x) => {
					const disturbName = generatorDisturbs[JSON.stringify(x.genius)];
					if (disturbName === undefined) return agg;
					// We count for two exposures if the user has gotten the answer correct
					// Thus incorrectly answered scenarios will appear more frequently
					agg[disturbName] += 1 * (x.grade === 100 ? 2 : 1);
					return agg;
				}, startObj);
				// Sum up the reciprocal of the counts for each generator to get a weight for selection
				const countSum: number = Object.values(genCounts).reduce((agg, genCount) => {
					return agg + (1 / Math.max(genCount, 1));
				}, 0);
				// Generate a random float between 0 and 1
				const randNum = Math.random();
				// Iterate over the disturbs, picking the generator which owns a given "weight window" between 0 and 1
				// Generators seen less frequently will have a larger window and are thus most likely to be selected
				// If we get to the last window and we still haven't picked a generator, then we should pick the last generator in the list
				let iterSum = 0;
				return (Object.entries(genCounts).find(([genNames, genCount]) => {
					iterSum = iterSum +  (1 / Math.max(genCount, 1));
					return (iterSum / countSum) > randNum;
				}) || [Object.keys(genCounts)[Object.keys(genCounts).length - 1]])[0];
			},
			nextABG() {
				// Naive random selection
				// const randomGen = Object.keys(abgGenerators)[Math.floor(Math.random() * Object.keys(abgGenerators).length)];
				// Experience-weighted random selection
				const randomGen = this.selectNewGenerator();
				this.answerSumitted = false;
				this.showGaps = false;
				[this.genBloodGas, this.geniusAnswer] = abgGenerators[randomGen](true);
				this.learnerAnswer = [];
				this.addedDisturb = false;
				this.activeChip = undefined;
				BIT.reset();
				BIT.startTimer();
				goTo("#abg-data", { offset: 40 });
			},
			percToColor(perc: number) {
				let r = 0;
				let g = 0;
				const b = 60;
				if (perc < 50) {
					r = 255;
					g = Math.round(5.1 * perc);
				} else {
					g = 200;
					r = Math.round(510 - 5.1 * perc);
				}
				const h = r * 0x10000 + g * 0x100 + b * 0x1;
				return "#" + ("000000" + h.toString(16)).slice(-6);
			},
			activateChipInfo(chipID: string) {
				if (chipID === "Normal") return;
				if (this.activeChip === chipID) {
					this.activeChip = undefined;
					goTo("#info-chips");
					return;
				}
				this.activeChip = chipID;
				goTo("#info-chips");
			},

		},
		computed: {
			addableDisturb(): DisturbType[][] {
				const primaryDisturb = [
					[DisturbType.RespAcid],
					[DisturbType.RespAlk],
					[DisturbType.MetAlk],
					[DisturbType.MetAcid],
					[DisturbType.MetAcid, DisturbType.AnionGap],
				];
				return primaryDisturb.filter((disturb) => {
					if (arrayEq(disturb, [DisturbType.MetAcid, DisturbType.AnionGap])) {
						return this.learnerAnswer.filter((x) => arrayEq(x, [DisturbType.MetAcid, DisturbType.AnionGap])).length < 1;
					}
					if ([DisturbType.RespAcid, DisturbType.RespAlk].includes(disturb[0])) {
						return this.learnerAnswer.filter((x) => {
							return [DisturbType.RespAcid, DisturbType.RespAlk].includes(x[0]);
						}).length === 0;
					}
					return this.learnerAnswer.filter((x: DisturbType[]) => arrayEq(disturb, x)).length === 0;
				});
			},
			gradeAnswer(): number {
				const learnerLeftovers = this.learnerAnswer.map((answer: DisturbType[]) => JSON.stringify(answer));
				const geniusLeftovers =  this.geniusAnswer.map((answer: DisturbType[]) => JSON.stringify(answer))
				.filter((disturbGroup: any) => {
					const learnerIndex = learnerLeftovers.indexOf(disturbGroup);
					if (learnerIndex === -1) return true;
					learnerLeftovers.splice(learnerIndex, 1);
					return false;
				});
				return Math.round(Math.max(
					100 * (this.geniusAnswer.length - (learnerLeftovers.length + geniusLeftovers.length)) / this.geniusAnswer.length,
					0,
				));
			},
			results(): any {
				return {
					adjustedPaO2: this.genBloodGas.adjustedPaO2(),
					o2Disturbance: this.genBloodGas.o2Disturbance(),
					pHDisturbance: this.genBloodGas.phDisturbance(),
					realisticABG: this.genBloodGas.realisticABG(),
					disturbances: this.genBloodGas.guessDisturbances(),
					pHExpected: this.genBloodGas.pHExpected(),
					serumAnionGap: this.genBloodGas.serumAnionGap(),
					serumDeltaGap: this.genBloodGas.serumDeltaGap(),
					tertiaryDisturbance: DisturbType.Unknown,
				};
			},
		},
		mounted() {
			this.$nextTick(function() {
				this.loadAnswerData().then(() => this.nextABG());
			});
		},
	});
</script>

<style>
	.instruction-list {
		margin-top: 14px;
	}
	.instruction-list li {
		margin-top: 4px;
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
	.disturb-btn {
		transform: scale(0.95);
	}
	@keyframes add-disturb-pulse {
		0% {
			background: transparent;
		}
		50% {
			background: #584014;
			opacity: 1;
		}
		100% {
			background: transparent;
		}
	}
	.add-disturb-btn::before {
		animation: add-disturb-pulse 2.2s ease-in-out infinite alternate;
	}
	@keyframes genius-disturb-pulse {
		0% {
			background: transparent;
		}
		50% {
			background: #77623c;
			opacity: 1;
		}
		100% {
			background: transparent;
		}
	}
	.genius-disturb.v-chip .v-chip__content  {
		animation: genius-disturb-pulse 1.4s ease-in-out infinite alternate;
	}
	#genius-info-panel {
		border-radius: 8px;
		padding: 20px;
		width: 94%;
		max-width: 1200px;
		margin: auto;
		margin-bottom: 20px;
		background-color: hsla(0, 0%, 16%, 1);
		box-shadow: 0px 0px 5px #202020 inset;
	}
	.score-box {
		padding: 14px 26px;
		font-weight: bold;
		font-size: 110%;
	}
	.review-tab{
		font-size: 80%;
	}
</style>
