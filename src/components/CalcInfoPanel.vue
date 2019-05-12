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
                        <center style="margin-bottom: 8px;"><h2>Interpreting: pH values</h2></center>
                        <p>
                            Normal human body pH is typically estimated to range between 7.35 and 7.45. 
                            When values fall below this range, it is called an <u>acidemia</u>, as the blood is abnormally acidic.
                            Above this range, and you will have an <u>alkalemia</u>, as the blood is abnormally basic.
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
                            <span v-if="results.pHExpected.between(abg.pH - 0.4, abg.pH + 0.4)">
                                Expected pH approximates ABG pH;  likely <u class="font-weight-black">VALID</u>.
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
                                <div style="border: 1px solid white; margin: 5px 15px; padding: 10px;">
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
                                <div style="border: 1px solid white; margin: 5px 15px; padding: 10px;">
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
                    <div v-if="activeChip == 'anionGap'" key="anionGap">
                        <Gamblegram :abg="abg" :results="results"/>
                    </div>
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
</style>
