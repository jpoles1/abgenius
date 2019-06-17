<template>
	<v-container>
		<center><h1>ABGenius Quiz</h1></center>
		<hr>
		<div>
			<center><h2>Arterial Blood Gas</h2></center><br>
			<v-layout text-xs-center wrap justify-center>
				<v-tooltip top>
					<template v-slot:activator="{ on }">
						<div v-on="on">
							<v-text-field readonly
								v-model.number="userBloodGas.abg.pH" 
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
								v-model.number="userBloodGas.abg.bicarb" 
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
								v-model.number="userBloodGas.abg.PaCO2" 
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
								v-model.number="userBloodGas.abg.Na" 
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
								v-model.number="userBloodGas.abg.Cl" 
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
		<div id="answer-container" v-if="!answerSumitted">
			<center>
				<h2>Interpret this ABG:</h2>
				<v-select
					style="width: 300px; max-width: 100%; text-align: center; text-align-last: center;"
					:items="addableDisturb"
					v-model="disturbToAdd"
				></v-select>
				<v-btn @click="addDisturb" color="orange">
					Add Acid-Base Disturbance
				</v-btn>
				<v-btn @click="submitAnswer" color="blue">
					Submit Answer
				</v-btn>
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
		</div>
		<div v-else>
			
		</div>
	</v-container>
</template>

<script lang="ts">
	import * as BG from "@/components/BloodGas";
	import { abgGenerators, generateRandABG } from "@/components/BloodGasGen";

	import Vue from "vue";
	export default Vue.extend({
		data() {
			return {
				answerSumitted: false,
				disturbToAdd: undefined as BG.DisturbType | undefined,
				refRngs: BG.RefRngs,
				userBloodGas: new BG.BloodGas({
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
			addDisturb() {
				if (this.disturbToAdd === undefined) return;
				if (this.disturbToAdd === BG.DisturbType.MetAcid) {
					this.learnerAnswer.push([this.disturbToAdd!, BG.DisturbType.Hyperchloremic]);
				} else {
					this.learnerAnswer.push([this.disturbToAdd!]);
				}
				this.disturbToAdd = undefined;
			},
			deleteDisturb(disturbIndex: number) {
				this.learnerAnswer.splice(disturbIndex, 1);
			},
			submitAnswer() {

			},
		},
		computed: {
			addableDisturb(): BG.DisturbType[] {
				const primaryDisturb = [BG.DisturbType.MetAcid, BG.DisturbType.MetAlk, BG.DisturbType.RespAcid, BG.DisturbType.RespAlk];
				return primaryDisturb.filter((disturb) => {
					if (disturb === BG.DisturbType.MetAcid) {
						return true;
					}
					if ([BG.DisturbType.RespAcid, BG.DisturbType.RespAlk].includes(disturb)) {
						return this.learnerAnswer.flat().filter((x) => [BG.DisturbType.RespAcid, BG.DisturbType.RespAlk].includes(x)).length === 0;
					}
					return this.learnerAnswer.flat().filter((x) => x === disturb).length === 0;
				});
			},
		},
		mounted() {
			this.$nextTick(function() {
				const randomGen = Object.keys(abgGenerators)[Math.floor(Math.random() * Object.keys(abgGenerators).length)];
				[this.userBloodGas, this.geniusAnswer] = abgGenerators[randomGen]();
			});
		},
	});
</script>

<style>
	.answer-disturb-box {
		min-width: 240px;
		min-height: 160px;
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
