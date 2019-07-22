<template>
	<div>
		<div v-show="activeChip != undefined">
			<div id="info-panel" style="overflow-x: auto;">
				<transition name="infos" mode="out-in">
					<div v-if="activeChip == 'O2'" key="O2" class="info-entry">
						<center style="margin-bottom: 8px;"><h2>Interpreting: PaO<sub>2</sub> values</h2></center>
						<p>
							PaO<sub>2</sub> is a measurement of the partial pressure of the oxygen disolved in an ABG sample. 
							This value can be measured using a Clark electrode.
							Physiologically appropriate values typically range between:
							<ul style="margin: 10px 0;">
								<li>
									<u>Age > 60</u>: &nbsp;&nbsp;&nbsp;&nbsp; (80 - (age - 60)) to 100
								</li>
								<li>
									<u>Newborns</u>: &nbsp;&nbsp; 40 to 70
								</li>
								<li>
									<u>Otherwise</u>: &nbsp;&nbsp; 80 to 100
								</li>
							</ul>

							When values fall below this range, it is called <u>hypoxemia</u>, as the blood is abnormally deoxygenated.
							Above this range, and you will have <u>hyperoxemia</u>. 
							This is most likely to be seen in patients receiving supplemental oxygen, and has been associated with increased rates of adverse events in acutely ill patients.
						</p>
					</div>
					<div v-if="activeChip == 'pH'" key="pH">
						<center style="margin-bottom: 8px; text-align: center;"><h2>Interpreting: pH values</h2></center>
						<hr>
						<p style="text-align: center;">
							Normal human body pH is typically estimated to range between 7.35 and 7.45. 
							When values fall below this range, it is called an <u>acidemia</u>, as the blood is abnormally acidic.
							Above this range, and you will have an <u>alkalemia</u>, as the blood is abnormally basic.
							The terms acidosis and alkalosis are used to describe the processes which result in these pH perturbations.
						</p>
						<p class="subheading font-weight-medium" style="text-align: center;"> 
							This ABG sample had a pH of <u class="font-weight-black">{{abg.pH}}</u> and is thus classified as <u class="font-weight-black">{{results.pHDisturbance.toUpperCase()}}</u>.
						</p>
						<p>
							We may utilize the Henderson-Hasselbalch formula in order to predict whether this ABG is internally consistent using the calculations below:
						</p>
						<p class="font-weight-medium font-italic" style="text-align: center; border-radius: 8px; background-color: #262626; padding: 10px;">
							Expected pH = 6.1 + log10([HCO<sub>3</sub>] / (0.03 * PaCO<sub>2</sub>)) = <u class="font-weight-bold">{{results.pHExpected.toFixed(2)}}</u>
							<br>
							Expected pH = 6.1 + log10({{abg.bicarb}} / (0.03 * {{abg.PaCO2}})) = <u class="font-weight-bold">{{results.pHExpected.toFixed(2)}}</u>
						</p>
						<p class="subheading font-weight-medium" style="text-align: center;">
							<span v-if="results.realisticABG">
								Expected pH approximates ABG pH, so ABG is likely <u class="font-weight-black">VALID</u>.
							</span>
							<span v-else>
								Expected pH differs from ABG pH; possibly <u class="font-weight-black">INVALID</u>.
								<br><br>
								<i>Check values!</i>
							</span>
						</p>
					</div>
					<div v-if="activeChip == 'primary'" key="primary">
						<center style="margin-bottom: 8px;"><h2>Interpreting: Primary Disturbance</h2></center>
						<center>
							<br>
							<v-layout wrap justify-center id="info-chips">
								<div class="decision-box">
									<v-chip :color="results.pHDisturbance == 'Alkalemia' ? 'success' : '#383838'">
										<v-icon small>fa-arrow-up</v-icon>pH&nbsp;<b>=</b>&nbsp;Alkalemia
									</v-chip>
									<hr>
									<v-chip :color="results.primaryDisturbance == 'Metabolic Alkalosis' ? 'success' : '#383838'">
										<v-icon small>fa-arrow-up</v-icon>[HCO<sub>3</sub>]&nbsp;<b>=</b>&nbsp;Metabolic Alkalosis
									</v-chip>
									<v-chip :color="results.primaryDisturbance == 'Respiratory Alkalosis' ? 'success' : '#383838'">
										<v-icon small>fa-arrow-down</v-icon>PaCO<sub>2</sub>&nbsp;<b>=</b>&nbsp;Respiratory Alkalosis
									</v-chip>
								</div>
								<div class="decision-box">
									<v-chip :color="results.pHDisturbance == 'Acidemia' ? 'success' : '#383838'">
										<v-icon small>fa-arrow-down</v-icon>pH&nbsp;<b>=</b>&nbsp;Acidemia
									</v-chip>
									<hr>
									<v-chip :color="results.primaryDisturbance == 'Metabolic Acidosis' ? 'success' : '#383838'">
										<v-icon small>fa-arrow-down</v-icon>[HCO<sub>3</sub>]&nbsp;<b>=</b>&nbsp;Metabolic Acidosis
									</v-chip>
									<v-chip :color="results.primaryDisturbance == 'Respiratory Acidosis' ? 'success' : '#383838'">
										<v-icon small>fa-arrow-up</v-icon>PaCO<sub>2</sub>&nbsp;<b>=</b>&nbsp;Respiratory Acidosis
									</v-chip>
								</div>
							</v-layout>
						</center>
						<br>
					</div>
					<v-container v-if="activeChip == 'anionGap'" key="anionGap">
						<center style="margin-bottom: 8px;"><h2>Interpreting: Anion Gap</h2></center>
						<hr>
						<v-layout row justify-center wrap>
							<v-flex md7 sm12 style="margin-bottom: 30px;">
								<Gamblegram :abg="abg" :results="results"/>
							</v-flex>
							<v-flex md5 style="background-color: #333; padding: 22px; box-shadow: 0px 0px 5px #202020 inset;">
								<p>
									This plot provides a visual representation of the balance between the "strong" anions and cations disolved in the serum. 
									Interpretation relies on the following rules:
									<ul>
										<li>
											Human serum is electroneutral, so the concentrations of anions and cations should cancel out.
										</li>
										<li>
											We measure the charged particles which dissociate completely and are present in the highest concentrations in serum, because they have the strongest effects on the overall balance of charges. We call them "strong ions".
										</li>
										<li>
											We cannot measure every charged species, so we must estimate the gap between the unknown anions and unknown cations, termed the anion gap. 
										</li>
									</ul>
								</p>
							</v-flex>
						</v-layout>
					</v-container>
					<v-container v-if="activeChip == 'deltaGap'" key="deltaGap">
						<center style="margin-bottom: 8px;">
							<h2>Interpreting: Delta Gap</h2>
							<p style="font-size: 115%; margin-top: 12px;">
								Delta Gap = ΔΔ Gap = Δ Anion Gap - Δ Bicarb
								<br>
								Δ Anion Gap = (Serum Anion Gap - Upper Range of Normal Anion Gap)
								<br>
								Δ Bicarb = (Serum Bicarb - Upper Range of Normal Bicarb)
							</p>
							<v-layout wrap justify-center>
								<div class="decision-box">
									if &nbsp;<u>Delta Gap &gt; 6</u>&nbsp; then
									<hr>
									We have a superimposed <u>metabolic alkalosis</u>!
									<hr>
									Given the rise in anion gap is more than fall in bicarb.
								</div>
								<div class="decision-box">
									if &nbsp;<u>Delta Gap &lt; -6</u>&nbsp; then
									<hr>
									We have a superimposed <u>metabolic acidosis</u>!
									<hr>
									Given the rise in anion gap is less than fall in bicarb.
								</div>
								<br class="flex-break" style="margin: 10px 0;">
								<div class="decision-box">
									<b>OTHERWISE:</b>
									<br>
									There are no additional metabolic acid-base disorders present.
								</div>
							</v-layout>
						</center>
					</v-container>
					<v-container v-if="['Respiratory Acidosis', 'Respiratory Alkalosis'].includes(activeChip)" key="disturb">
						<center>
							<h2>Interpreting: Respiratory Acid-Base Disturbances</h2>
							<hr>
							<v-layout wrap justify-center style="margin: 22px;">
								<div class="decision-box">
									<h3>PaCO<sub>2</sub> = {{abg.PaCO2}}</h3>
									<div style="background-color: #272727; padding: 5px 14px; display: inline-block; font-size: 80%; border-radius: 3px; margin-top: 6px;">
										<i>
											Ref Range&nbsp; &#8776; &nbsp;{{refRngs.PaCO2.lower + "&nbsp; to &nbsp;" + refRngs.PaCO2.upper}}
										</i>
									</div>
									<hr>
									<v-chip :color="activeChip == 'Respiratory Acidosis' ? 'success' : '#383838'">
										<v-icon small>fa-arrow-up</v-icon>PaCO<sub>2</sub>&nbsp;<b>=</b>&nbsp;Respiratory Acidosis
									</v-chip>
									<v-chip :color="activeChip == 'Respiratory Alkalosis' ? 'success' : '#383838'">
										<v-icon small>fa-arrow-down</v-icon>PaCO<sub>2</sub>&nbsp;<b>=</b>&nbsp;Respiratory Alkalosis
									</v-chip>
								</div>
							</v-layout>
							<p style="font-size: 90%; margin: 28px 0 36px 0; max-width: 600px; text-align: justify;">
								Put simply, respiratory acid-base disorders result from changes in the balance of the biochemical processes which add and remove from the pools of CO<sub>2</sub> disolved in the blood.
								Changes in the concentration of disolved CO<sub>2</sub> can be measured as a function of the partial pressure of arterial blood CO<sub>2</sub> (abbreviated PaCO<sub>2</sub>).
								<br><br>
								How then does a change in disolved CO<sub>2</sub> change the pH of the blood? 
								A simplified understanding of the complex biochemistry occuring here can be acheived by examining Fig 1 below.
								Here we see the disolution of CO<sub>2</sub> followed by its reaction with water (H<sub>2</sub>O) to form carbonic acid (H<sub>2</sub>CO<sub>3</sub>).
								An H<sup>+</sup> ion can then dissociate from the carbonic acid cancelling out the buffering capacity of the body's stores of HCO<sub>3</sub><sup>-</sup>, and decreasing blood pH. 
								This same reaction can be driven in reverse when levels of disolved CO<sub>2</sub> are low, increasing blood pH.
							</p>
							<img src="/img/co2_to_bicarb.png"
							height=100 style="border-radius: 3px;"/>
						</center>
					</v-container>
				</transition>
			</div>
			<hr>
		</div>
	</div>
</template>

<script lang="ts">
import Vue from "vue";

import * as BG from "./BloodGas";
import Gamblegram from "@/components/Gamblegram.vue";

export default Vue.extend({
	components: {
		Gamblegram,
	},
	props: {
		activeChip: String,
		abg: Object,
		results: Object,
	},
	data() {
		return {
			refRngs: BG.RefRngs,
		};
	},
});
</script>

<style>
	.v-icon{
		margin: 0px 5px;
	}
	#info-panel{
		border-radius: 8px;
		background-color: hsla(0, 0%, 16%, 1);
		padding: 20px;
		width: 100%;
		max-width: 1200px;
		margin: auto;
		box-shadow: 0px 0px 5px #202020 inset;
	}
	.infos-enter-active, .infos-leave-active {
		transition: all 0.3s;
	}
	.infos-enter, .infos-leave-to {
		opacity: 0;
		transform: translateY(-30px);
	}
	.decision-box {
		border: 1px solid #666;
		margin: 5px 15px;
		padding: 10px;
		border-radius: 3px;
		background-color: #333;
	}
	.decision-box u {
		font-size: 110%;
	}
</style>
