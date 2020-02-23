<template>
	<div>
		<div v-show="activeChip != undefined">
			<div style="overflow-x: auto;">
				<transition-group name="infos" mode="out-in">
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
							The terms <i>acidosis</i> and <i>alkalosis</i> are used to describe the processes which result in these pH perturbations.
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
					<v-container v-if="activeChip == 'anionGap'" key="anionGap">
						<center style="margin-bottom: 8px;"><h2>Interpreting: Anion Gap</h2></center>
						<hr>
						<v-layout wrap justify-center style="margin: 22px; text-align: center;">
							<div class="decision-box">
								<h3>Anion Gap = [Na<sup>+</sup>] - [Cl<sup>-</sup>] - [HCO<sub>3</sub><sup>-</sup>] = {{results.serumAnionGap.gap}}</h3>
								<div class="ref-rng-box">
									<i>
										Ref Range&nbsp; &#8776; &nbsp;{{refRngs.AnionGap.lower + "&nbsp; to &nbsp;" + refRngs.AnionGap.upper}}
									</i>
								</div>
								<hr>
								<v-chip :color="results.serumAnionGap.disturb === 'Anion Gap' ? 'success' : '#383838'">
									<v-icon small>fa-arrow-up</v-icon>Anion Gap&nbsp;<b>=</b>&nbsp;Metabolic Acidosis
								</v-chip>
								<v-chip :color="results.serumAnionGap.disturb !== 'Anion Gap' ? 'success' : '#383838'">
									<v-icon small>fa-arrows-alt-h</v-icon>Anion Gap&nbsp;<b>=</b>&nbsp;Normal
								</v-chip>
							</div>
						</v-layout>
						<p style="text-align: center;">
							There are many different organic and inorganic acids which can accumulate in the blood of a patient causing acidosis.
							Unlike the bicarbonate value, we cannot hope to measure the levels of all of these acidic species to figure out if any are present.   
							Instead, we use the anion gap to decide if there is a significant contribution of H<sup>+</sup> ions from unmeasured acidic species in a patient's blood. 
							We rely on the principle of electroneutrality (described below)	to indirectly detect increases in the negatively charged particles produced be deprotonation.
						</p>
						<v-layout row justify-center wrap style="border-radius: 8px; background-color: #262626; padding: 18px; margin: 20px 0; box-shadow: 0px 0px 5px #202020 inset;">
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
						<center style="margin-bottom: 8px;"><h2>Causes of Anion Gap Acidosis</h2></center>
						<hr>
						<p style="text-align: center;">
							There are numerous physiologic processes and biologically active substances which can cause to anion gap acidosis, and it's impossible to remember them all.
							We recommend the GOLDMARK CAT mnemonic shown below in order to organize your differential around the most important causes of anion gap acidois:
						</p>
						<div style="display: flex; justify-content: space-around; align-items: center; flex-wrap: wrap; max-width: 800px; margin: auto;" class="anion-gap-chart">
							<div style="font-size: 140%;">
								<b>G</b>lycols (ethylene/propylene)<br>
								<b>O</b>xoproline<br>
								<b>L</b>-lactate<br>
								<b>D</b>-lactate (short bowel syndrome)<br>
								<b>M</b>ethanol<br>
								<b>A</b>spirin<br>
								<b>R</b>enal failure<br>
								<b>K</b>etoacidosis<br>
							</div>
							<div style="font-size: 145%;">
								<b>C</b>yanide (or Carbon Monoxide)<br>
								<b>A</b>minoglycosides<br>
								<b>T</b>olune (or Theophylline)<br>
							</div>
						</div>
					</v-container>
					<v-container v-if="activeChip == 'deltaGap'" key="deltaGap">
						<center style="margin-bottom: 8px;">
							<h2>Interpreting: Delta Gap</h2>
							<hr>
							<p style="font-size: 115%; margin-top: 12px;">
								Delta Gap = ΔΔ Gap = Δ Anion Gap - Δ Bicarb = <b>{{results.serumDeltaGap.gap}}</b>
								<br>
								Δ Anion Gap = (Serum Anion Gap - Upper Range of Normal Anion Gap)
								<br>
								Δ Bicarb = (Serum Bicarb - Upper Range of Normal Bicarb)
							</p>
							<v-layout wrap justify-center>
								<div class="decision-box" :style="{'background-color': results.serumDeltaGap.gap > 6 ? '#4CAF50' : '#333'}">
									if &nbsp;<u>Delta Gap &gt; 6</u>&nbsp; then
									<hr>
									We have a superimposed <u>metabolic alkalosis</u>!
									<hr>
									Given the rise in anion gap is more than fall in bicarb.
								</div>
								<div class="decision-box" :style="{'background-color': results.serumDeltaGap.gap < -6 ? '#4CAF50' : '#333'}">
									if &nbsp;<u>Delta Gap &lt; -6</u>&nbsp; then
									<hr>
									We have a superimposed <u>metabolic acidosis</u>!
									<hr>
									Given the rise in anion gap is less than fall in bicarb.
								</div>
								<div class="flex-break" style="margin: 10px 0;" />
								<div class="decision-box" :style="{'background-color': results.serumDeltaGap.gap >= -6 && results.serumDeltaGap.gap <= 6 ? '#4CAF50' : '#333'}">
									<b>OTHERWISE:</b>
									<br>
									There are no additional metabolic acid-base disorders present.
								</div>
							</v-layout>
						</center>
					</v-container>
					<div v-if="activeChip.includes('Primary')" key="primary">
						<v-tabs>
							<v-tab href="#primary-dx">Diagnosis</v-tab>
							<v-tab href="#primary-causes" v-if="results.disturbances[0] !== 'Normal'">Causes</v-tab>
							<v-tab href="#primary-treatment"  v-if="results.disturbances[0] !== 'Normal'">Treatment</v-tab>
							<v-tab-item value="primary-dx" class="primary-disturb-tab">
								<center><h2>Interpreting: Primary Disturbance</h2></center>
								<center>
									<br>
									<v-layout wrap justify-center>
										<div class="decision-box">
											<v-chip :color="results.pHDisturbance == 'Alkalemia' ? 'success' : '#383838'">
												<v-icon small>fa-arrow-up</v-icon>pH&nbsp;<b>=</b>&nbsp;Alkalemia
											</v-chip>
											<hr>
											<v-chip :color="results.disturbances[0] == 'Metabolic Alkalosis' ? 'success' : '#383838'">
												<v-icon small>fa-arrow-up</v-icon>[HCO<sub>3</sub>]&nbsp;<b>=</b>&nbsp;Metabolic Alkalosis
											</v-chip>
											<v-chip :color="results.disturbances[0] == 'Respiratory Alkalosis' ? 'success' : '#383838'">
												<v-icon small>fa-arrow-down</v-icon>PaCO<sub>2</sub>&nbsp;<b>=</b>&nbsp;Respiratory Alkalosis
											</v-chip>
										</div>
										<div class="decision-box">
											<v-chip :color="results.pHDisturbance == 'Acidemia' ? 'success' : '#383838'">
												<v-icon small>fa-arrow-down</v-icon>pH&nbsp;<b>=</b>&nbsp;Acidemia
											</v-chip>
											<hr>
											<v-chip :color="results.disturbances[0] == 'Metabolic Acidosis' ? 'success' : '#383838'">
												<v-icon small>fa-arrow-down</v-icon>[HCO<sub>3</sub>]&nbsp;<b>=</b>&nbsp;Metabolic Acidosis
											</v-chip>
											<v-chip :color="results.disturbances[0] == 'Respiratory Acidosis' ? 'success' : '#383838'">
												<v-icon small>fa-arrow-up</v-icon>PaCO<sub>2</sub>&nbsp;<b>=</b>&nbsp;Respiratory Acidosis
											</v-chip>
										</div>
									</v-layout>
								</center>
								<hr><br>
								<center v-if="['Primary Respiratory Acidosis', 'Primary Respiratory Alkalosis'].includes(activeChip)">
									<h2>Primary Respiratory Acid-Base Disturbances</h2>
									<v-layout wrap justify-center style="margin: 22px;">
										<div class="decision-box">
											<h3>PaCO<sub>2</sub> = {{abg.PaCO2}}</h3>
											<div class="ref-rng-box">
												<i>
													Ref Range&nbsp; &#8776; &nbsp;{{refRngs.PaCO2.lower + "&nbsp; to &nbsp;" + refRngs.PaCO2.upper}}
												</i>
											</div>
											<hr>
											<v-chip :color="activeChip == 'Primary Respiratory Acidosis' ? 'success' : '#383838'">
												<v-icon small>fa-arrow-up</v-icon>PaCO<sub>2</sub>&nbsp;<b>=</b>&nbsp;Respiratory Acidosis
											</v-chip>
											<v-chip :color="activeChip == 'Primary Respiratory Alkalosis' ? 'success' : '#383838'">
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
								<center v-if="['Primary Metabolic Acidosis', 'Primary Metabolic Alkalosis'].includes(activeChip)" key="disturb">
									<div>
										<h2>Primary Metabolic Acid-Base Disturbances</h2>
										<v-layout wrap justify-center style="margin-top: 28px;">
											<div class="decision-box">
												<h3>[&nbsp;HCO<sub>3</sub><sup>-</sup>&nbsp;] = {{abg.bicarb}}</h3>
												<div class="ref-rng-box">
													<i>
														Ref Range&nbsp; &#8776; &nbsp;{{refRngs.aBicarb.lower + "&nbsp; to &nbsp;" + refRngs.aBicarb.upper}}
													</i>
												</div>
												<hr>
												<v-chip :color="abg.bicarb > refRngs.aBicarb.upper ? 'success' : '#383838'">
													<v-icon small>fa-arrow-up</v-icon>[&nbsp;HCO<sub>3</sub><sup>-</sup>&nbsp;]&nbsp;<b>=</b>&nbsp;Metabolic Alkalosis
												</v-chip>
												<v-chip :color="results.serumAnionGap.disturb == 'Normal' && abg.bicarb < refRngs.aBicarb.lower ? 'success' : '#383838'">
													<v-icon small>fa-arrow-down</v-icon>[&nbsp;HCO<sub>3</sub><sup>-</sup>&nbsp;]&nbsp;<b>=</b>&nbsp;Metabolic Acidosis
												</v-chip>
												<br>
												<v-chip :color="results.serumAnionGap.gap > refRngs.AnionGap.upper ? 'success' : '#383838'">
													<v-icon small>fa-arrow-up</v-icon>Anion Gap&nbsp;<b>=</b>&nbsp;Metabolic Acidosis
												</v-chip>
											</div>
										</v-layout>
										<p style="font-size: 100%; margin-top: 12px;">
											Primary metabolic acid-base disorders are characterized by shifts in the plasma concentrations of bicarbonate.
											An increase in plasma <span style="white-space: nowrap;">bicarbonate concentration (<v-icon small>fa-arrow-up</v-icon>[&nbsp;HCO<sub>3</sub><sup>-</sup>&nbsp;]&nbsp;)</span> represents a <u>metabolic alkalosis</u>. 
											On the other hand a decrease in plasma <span style="white-space: nowrap;">bicarbonate concentration (<v-icon small>fa-arrow-down</v-icon>[&nbsp;HCO<sub>3</sub><sup>-</sup>&nbsp;]&nbsp;)</span> represents a (non-anion gap) <u>metabolic acidosis</u>.
										</p>
									</div>
								</center>
							</v-tab-item>
							<v-tab-item value="primary-causes" class="primary-disturb-tab">
								<div v-if="activeChip === 'Primary Metabolic Alkalosis'">
									<h2>Causes of Primary Metabolic Alkalosis</h2>
									<hr>
									<p>
										There are many ways to classify the processes leading to metabolic alkalosis.
										Generally these pathologies fall into the categories of chloride depletion syndromes, mineralocorticoid excess syndromes, acid loss, and alkali administration.
										Another intuitive way to group these processes is based upon chloride concentration, which is linked to (but not determined by) overall volume status.
										Some pathologies are termed hyperchloremic or "chloride depletion/responsive" metabolic alkaloses, meaning they correct with administration of chloride (sometimes mistermed "volume depletion/responsive").
										Others are chloride unresponsive, and tend to result from pathologic perturbations of the Renin-Angiotensin-Aldosterone axis.
									</p>
									<div style="display: flex; justify-content: space-around; flex-wrap: wrap; flex: 1;">
										<div style="max-width: 45%; min-width: 240px; margin: 18px; border-radius: 8px; background-color: #262626; box-shadow: 0px 0px 5px #202020 inset; padding: 24px 20px;">
											<h4 style="margin-bottom: 8px;">Hypochloremic (Cl<sup>-</sup> Responsive) Metabolic Alkalosis</h4>
											<hr>
											<ul style="text-align: left;">
												<li>Vomiting or gastric suctioning (amplified by loss of H<sup>+</sup>)</li>
												<li>Chloride rich diarrhea (genetic defect, villous adenoma/McKittrick-Wheelock syndrome, and high-output illeostomy drainage)</li>
												<li>Renal chloride losses (loop/thiazide diuretics, Bartter/Gitelman syndromes)</li>
												<li>Hypokalemia and Hypomagnesemia</li>
											</ul>
										</div>
										<div style="max-width: 45%; min-width: 240px; margin: 18px; border-radius: 8px; background-color: #262626; box-shadow: 0px 0px 5px #202020 inset; padding: 24px 20px;">
											<h4 style="margin-bottom: 8px;">Normochloremic (Cl<sup>-</sup> Unresponsive) Metabolic Alkalosis</h4>
											<hr>
											<ul style="text-align: left;">
												<li>Primary hyperaldosteronism</li>
												<li>Secondary hyperaldosternism (renal artery stenosis, Cushing syndrome/disease, renin-secreting tumor, volume depletion, heart failure, cirrhosis with ascites, and nephrotic syndrome)</li>
												<li>Glycyrrhizin Intoxication (compound found in some licorice and chewing tobacco, inhibits cortisol breakdown)</li>
												<li>Liddle syndrome and 11β-hydroxysteroid dehydrogenase deficiency</li>
											</ul>
										</div>
									</div>
									<i>Quick Tip: <u>Bartter</u> syndrome mimics <u>loop diuretics</u>, while <u>Gitelman</u> syndrome mimics <u>thiazide diuretics</u>.</i>
								</div>
								<div v-if="activeChip === 'Primary Metabolic Acidosis'">
									<h2>Causes of Primary Non-gap Metabolic Acidosis</h2>
									<hr>
									<p>
									</p>
									<div style="display: flex; justify-content: space-around; align-items: center; flex-wrap: wrap; max-width: 800px; margin: auto;" class="anion-gap-chart">
										<div style="font-size: 140%;">
											<b>U</b>reteroenterostomies<br>
											<b>S</b>mall bowel fistulae<br>
											<b>E</b>xcess chloride<br>
											<b>D</b>iarrhea<br>
										</div>
										<div style="font-size: 145%;">
											<b>C</b>arbonic anhydrase inhibitors<br>
											<b>R</b>enal tubular acidosis<br>
											<b>A</b>ddison's disease<br>
											<b>P</b>ancreatoenterostomies<br>
										</div>
									</div>
									<!-- 
										Acetazolamide blocks uptake of [HCO<sub>3</sub>] in proximal tubule
									-->
								</div>
								<div v-if="activeChip === 'Primary Respiratory Alkalosis'">
									<h2>Causes of Primary Respiratory Alkalosis</h2>
									<hr>
									<p>
										Any process causing hyperventilation (an increased respiratory rate or tidal volume) will result in an increased rate of CO<sub>2</sub> elimination, shifting the equilibrium towards dehydration of H<sub>2</sub>CO<sub>3</sub> to CO<sub>2</sub> and removal  of bicarbonate from the blood.
									</p>
									<div style="display: flex; justify-content: space-around; flex-wrap: wrap; flex: 1;">
										<div style="width: 45%; min-width: 240px; margin: 18px; border-radius: 8px; background-color: #262626; box-shadow: 0px 0px 5px #202020 inset; padding: 24px 20px;">
											<h4 style="margin-bottom: 8px;">Central Causes of Hyperventilation</h4>
											<hr>
											<ul style="text-align: left;">
												<li>Head injury/Stroke</li>
												<li>Anxiety, pain, fear, stress</li>
												<li>Pharmaceuticals/toxins (salicylates)</li>
												<li>Hypoxic respiratory drive</li>
												<li>Hyperthyroidism</li>
											</ul>
										</div>
										<div style="width: 45%; min-width: 240px; margin: 18px; border-radius: 8px; background-color: #262626; box-shadow: 0px 0px 5px #202020 inset; padding: 24px 20px;">
											<h4 style="margin-bottom: 8px;">Pulmonary Causes</h4>
											<hr>
											<ul style="text-align: left;">
												<li>Pulmonary embolisms, pneumothorax, pneumonia, and acute asthma or COPD</li>
												<li>Hyperventilation during mechanical ventilation</li>
											</ul>
										</div>
									</div>
								</div>
								<div v-if="activeChip === 'Primary Respiratory Acidosis'">
									<h2>Causes of Primary Respiratory Acidosis</h2>
									<hr>
									<p>
										Any process causing hypoventilation (a decreased respiratory rate or tidal volume) or deficient gas-exchange will result in an accumulation of CO<sub>2</sub> in the blood, shifting the equilibrium towards hydration of CO<sub>2</sub> to  H<sub>2</sub>CO<sub>3</sub> and increasing levels of bicarbonate in the blood.
									</p>
									<div style="display: flex; justify-content: space-around; flex-wrap: wrap; flex: 1;">
										<div style="width: 45%; min-width: 240px; margin: 18px; border-radius: 8px; background-color: #262626; box-shadow: 0px 0px 5px #202020 inset; padding: 24px 20px;">
											<h4 style="margin-bottom: 8px;">Central Causes of Hypoventilation</h4>
											<hr>
											<ul style="text-align: left;">
												<li>Head injury/Stroke</li>
												<li>CNS depressants (opioids, sedative/hypnotics)</li>
												<li>Neuromuscular blockade (paralytics, botulism, Guillain-Barre syndrome)</li>
												<li>Sleep Apnea/Obesity hypoventilation syndrome</li>
											</ul>
										</div>
										<div style="width: 45%; min-width: 240px; margin: 18px; border-radius: 8px; background-color: #262626; box-shadow: 0px 0px 5px #202020 inset; padding: 24px 20px;">
											<h4 style="margin-bottom: 8px;">Pulmonary Causes</h4>
											<hr>
											<ul style="text-align: left;">
												<li>Respiratory Failure</li>
												<li>Airflow obstruction (COPD, asthma)</li>
												<li>Severe interstitial lung disease</li>
											</ul>
										</div>
									</div>
								</div>
							</v-tab-item>
							<v-tab-item value="primary-treatment" class="primary-disturb-tab">
								<div v-if="activeChip === 'Primary Metabolic Alkalosis'">
									<h2>Treatment of Primary Metabolic Alkalosis</h2>
									<hr>
									<b><u>The mainstay of treatment for metabolic alkalosis is the diagnosis and correction of the underlying pathology.</u></b>
									<div style="display: flex; justify-content: space-around; flex-wrap: wrap; flex: 1;">
										<div style="max-width: 45%; min-width: 240px; margin: 18px; border-radius: 8px; background-color: #262626; box-shadow: 0px 0px 5px #202020 inset; padding: 24px 20px;">
											<h4 style="margin-bottom: 8px;">Hypochloremic (Cl<sup>-</sup> Responsive) Metabolic Alkalosis</h4>
											<hr>
											<ul style="text-align: left;">
												<li>Replacement of chloride (often in the form of 0.9% saline) can also help to correct the alkalosis</li>
												<li>Those patients actively losing H<sup>+</sup> and Cl<sup>-</sup> from nasogastric suction or vomiting, might also benefit from an H<sub>2</sub> receptor antagonist or proton pump inhibitor.</li>
												<li>In the patients with volume overload a combination of potassium chloride and carbonic anhydrase inhibitors like acetazolamide (which promote renal bicarbonate elimination) may be employed.  </li>
											</ul>
										</div>
										<div style="max-width: 45%; min-width: 240px; margin: 18px; border-radius: 8px; background-color: #262626; box-shadow: 0px 0px 5px #202020 inset; padding: 24px 20px;">
											<h4 style="margin-bottom: 8px;">Normochloremic (Cl<sup>-</sup> Unresponsive) Metabolic Alkalosis</h4>
											<hr>
											<ul style="text-align: left;">
												<li>Mineralocorticoid excess is treated by restricting a patient’s sodium intake and adding potassium supplementation</li>
												<li>Patients with Liddle syndrome and 11β-hydroxysteroid dehydrogenase deficiency may benefit from the addition of amiloride.</li>
											</ul>
										</div>
									</div>
									<i>Quick Tip: In those rare cases of severe alkalosis (pH > 7.55 or signs of cardiac/CNS damage) with volume overload or renal failure, infusion of hydrochloric acid (HCl) into a central line or dialysis may be indicated.</i>
								</div>
								<div v-if="activeChip === 'Primary Metabolic Acidosis'">
									<h2>Treatment of Primary Metabolic Acidosis</h2>
									<hr>
									<b><u>The mainstay of treatment for metabolic acidosis is the diagnosis and correction of the underlying pathology.</u></b>
								</div>
								<div v-if="activeChip === 'Primary Respiratory Alkalosis'">
									<h2>Treatment of Primary Respiratory Alkalosis</h2>
									<hr>
									<b><u>The mainstay of treatment for primary respiratory alkaloses is the diagnosis and correction of the underlying pathology.</u></b>
									<ul style="text-align: left;">
										<li>Anxiolytics may help to reduce psychogenic hyperventilation.</li>
										<li>Prolonged hyperventilation may culminate in respiratory failure and the need for intubation and mechanical ventilation.</li>
										<li>Patients with iatrogenic respiratory alkalsosis require close monitoring of their ventilator settings, and may benefit from a reduced respiratory rate.</li>
									</ul>						
								</div>
								<div v-if="activeChip === 'Primary Respiratory Acidosis'">
									<h2>Treatment of Primary Respiratory Acidosis</h2>
									<hr>
									<b><u>The mainstay of treatment for primary respiratory acidosis is the diagnosis and correction of the underlying pathology.</u></b>
									<ul style="text-align: left;">
										<li>Bronchodilators (albuterol/ipratroprium) can be used to treat obstructive airway diseases.</li>
										<li>Opiate-induced respiratory depression can be reversed with naloxone.</li>
										<li>Intubation and mechanical ventilation may be necessary in cases of impending respiratory failure to prevent further decompensation.</li>
									</ul>						
								</div>
							</v-tab-item>
						</v-tabs>
					</div>
					<v-container v-if="['Compensatory Respiratory Alkalosis'].includes(activeChip)" key="disturb">
						<center>
							<h2>Interpreting: Respiratory Compensation</h2>
							<hr>
							<p style="font-size: 100%; margin-top: 12px;">
								In 1967, Dr. Robert Winters <i>et al.</i> published a paper entitled <u>Quantitative Displacement of Acid-Base Equilibrium in Metabolic Acidosis</u>,
								which included a population of 60 patients with a known metabolic acidosis who had not yet received treatment.
								The manuscript describes a linear trend between plasma bicarbonate and the expected compensatory change in P<sub>a</sub>CO<sub>2</sub> (see below).
								We can use an equation derived from this linear regression to determine if our patient is adequately compensating for the metabolic acidosis by increasing their ventilation and causing a respiratory alkalosis. 
							</p>
							<hr>
							<div style="display: flex; justify-content: space-around; max-width: 100%;  flex-wrap: wrap; margin-top: 25px;">
								<div class="decision-box" style="display: flex; align-items: center; margin-bottom: 20px;">
									<div>
										<h3>PaCO<sub>2</sub> = {{abg.PaCO2}}</h3>
										<h3>Expected P<sub>a</sub>CO<sub>2</sub> = {{ (1.5 * abg.bicarb) + 8}} &plusmn; 2 = {{ (1.5 * abg.bicarb) + 6}} to {{ (1.5 * abg.bicarb) + 10}} </h3>
										<hr>
										<b>Winter's Formula:</b>
										<br>
										Expected P<sub>a</sub>CO<sub>2</sub> = (1.5 * [&nbsp;HCO<sub>3</sub><sup>-</sup>&nbsp;]) + 8 &plusmn; 2
										<hr>
										<v-chip :color="results.completeCompensation ? 'success' : '#383838'">
											<v-icon small>fa-check</v-icon>&nbsp;Complete Respiratory Compensation
										</v-chip>
										<v-chip :color="!results.completeCompensation ? 'warning' : '#383838'">
											<v-icon small>fa-times</v-icon>Incomplete Respiratory Compensation
										</v-chip>
									</div>
								</div>
								<img src="/img/winters_formula_plot.png" width=300 style="border-radius: 3px;"/>
							</div>
						</center>
					</v-container>
					<v-container v-if="['Compensatory Respiratory Acidosis'].includes(activeChip)" key="disturb">
						<center>
							<h2>Interpreting: Respiratory Compensation</h2>
							<hr>
							<p style="font-size: 100%; margin-top: 12px;">
							</p>
							<div style="display: flex; justify-content: space-around; max-width: 100%;  flex-wrap: wrap; margin-top: 25px;">
								<div class="decision-box" style="display: flex; align-items: center; margin-bottom: 20px;">
									<div>
										<h3>PaCO<sub>2</sub> = {{abg.PaCO2}}</h3>
										<h3>Expected P<sub>a</sub>CO<sub>2</sub> = {{ ((0.7 * abg.bicarb) + 20).toFixed(1) }} &plusmn; 2 = {{ ((0.7 * abg.bicarb) + 18).toFixed(1) }} to {{ ((0.7 * abg.bicarb) + 22).toFixed(1) }} </h3>
										<div class="ref-rng-box">
											<i>
												Expected P<sub>a</sub>CO<sub>2</sub> = (0.7 * [&nbsp;HCO<sub>3</sub><sup>-</sup>&nbsp;]) + 20 &plusmn; 2
											</i>
										</div>
										<hr>
										<v-chip :color="results.completeCompensation ? 'success' : '#383838'">
											<v-icon small>fa-check</v-icon>&nbsp;Complete Respiratory Compensation
										</v-chip>
										<v-chip :color="!results.completeCompensation ? 'warning' : '#383838'">
											<v-icon small>fa-times</v-icon>Incomplete Respiratory Compensation
										</v-chip>
									</div>
								</div>
							</div>
						</center>
					</v-container>
					<v-container v-if="['Compensatory Metabolic Acidosis'].includes(activeChip)" key="disturb">
						<center>
							<h2>Interpreting: Metabolic Compensation</h2>
							<hr>
							<p style="font-size: 100%; margin-top: 12px;">
							</p>
							<div style="display: flex; justify-content: space-around; max-width: 100%;  flex-wrap: wrap; margin-top: 25px;">
								<div class="decision-box" style="display: flex; align-items: center; margin-bottom: 20px;">
									<div>
										<h3>[&nbsp;HCO<sub>3</sub><sup>-</sup>&nbsp;] = {{abg.bicarb}}</h3>
										<h3>Expected [&nbsp;HCO<sub>3</sub><sup>-</sup>&nbsp;] = {{((abg.PaCO2 - PaCO2Mid) / 2)}} + 24 &plusmn; 2 = {{22 - ((PaCO2Mid - abg.PaCO2) / 2)}} to {{26 - ((PaCO2Mid - abg.PaCO2) / 2)}}</h3>
										<div class="ref-rng-box">
											<i>
												Expected [&nbsp;HCO<sub>3</sub><sup>-</sup>&nbsp;] = ((P<sub>a</sub>CO<sub>2</sub> - {{PaCO2Mid}}) / 2) + 24 &plusmn; 2
											</i>
										</div>
										<hr>
										<v-chip :color="results.completeCompensation ? 'success' : '#383838'">
											<v-icon small>fa-check</v-icon>&nbsp;Complete Metabolic Compensation
										</v-chip>
										<v-chip :color="!results.completeCompensation ? 'warning' : '#383838'">
											<v-icon small>fa-times</v-icon>Incomplete Metabolic Compensation
										</v-chip>
									</div>
								</div>
							</div>
						</center>
					</v-container>
					<v-container v-if="['Compensatory Metabolic Alkalosis'].includes(activeChip)" key="disturb">
						<center>
							<h2>Interpreting: Metabolic Compensation</h2>
							<hr>
							<p style="font-size: 100%; margin-top: 12px;">
								In order to counteract the rise in pH which results from excess P<sub>a</sub>CO2
							</p>
							<div style="display: flex; justify-content: space-around; max-width: 100%;  flex-wrap: wrap; margin-top: 25px;">
								<div class="decision-box" style="display: flex; align-items: center; margin-bottom: 20px;">
									<div>
										<h3>[&nbsp;HCO<sub>3</sub><sup>-</sup>&nbsp;] = {{abg.bicarb}}</h3>
										<h3>Expected [&nbsp;HCO<sub>3</sub><sup>-</sup>&nbsp;] = {{(((abg.PaCO2 - PaCO2Mid) / 3) + 24).toFixed(1)}} &plusmn; 2 = {{(((abg.PaCO2 - PaCO2Mid) / 3) + 22).toFixed(1)}} to {{(((abg.PaCO2 - PaCO2Mid) / 3) + 26).toFixed(1)}}</h3>
										<div class="ref-rng-box">
											<i>
												Expected [&nbsp;HCO<sub>3</sub><sup>-</sup>&nbsp;] = ((P<sub>a</sub>CO<sub>2</sub> - {{PaCO2Mid}}) / 3) + 24 &plusmn; 2
											</i>
										</div>
										<hr>
										<v-chip :color="results.completeCompensation ? 'success' : '#383838'">
											<v-icon small>fa-check</v-icon>&nbsp;Complete Metabolic Compensation
										</v-chip>
										<v-chip :color="!results.completeCompensation ? 'warning' : '#383838'">
											<v-icon small>fa-times</v-icon>Incomplete Metabolic Compensation
										</v-chip>
									</div>
								</div>
							</div>
						</center>
					</v-container>
				</transition-group>
			</div>
		</div>
	</div>
</template>

<script lang="ts">
import Vue from "vue";

import * as BG from "./BloodGas";
import { arrayEq } from "@/util";
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
			PaCO2Mid: BG.RefRngMidpoint("PaCO2"),
			arrayEq,
		};
	},
});
</script>

<style>
	.v-icon{
		margin: 0px 5px;
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
	}
	.decision-box u {
		font-size: 110%;
	}
	.ref-rng-box { 
		background-color: #272727;
		padding: 5px 14px;
		display: inline-block;
		font-size: 80%;
		border-radius: 3px;
		margin-top: 6px;
	}
	.anion-gap-chart div {
		margin: 8px 18px;
	}
	.anion-gap-chart b {
		font-size: 110%;
		color: #d2a6dd;
	}
	.primary-disturb-tab {
		background-color: #222;
		padding: 20px;
	}
</style>
