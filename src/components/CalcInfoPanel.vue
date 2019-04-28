<template>
    <div v-if="activeChip != undefined">
        <div v-if="activeChip == 'pH'" transition="slide-y-transition">
            <center style="margin-bottom: 8px;"><h2>Interpreting pH values</h2></center>
            <p>
                Normal human body pH is typically estimated to range between 7.35 and 7.45. 
                When values fall below this range, it is called an <u>acidemia</u>, as the blood is abnormally acidic.
                Above this range, and you will have an <u>alkalemia</u>, as the blood is abnormally basic.
            </p>
            <p class="title" style="text-align: center;"> 
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
            <p class="title" style="text-align: center;">
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
        <hr>
    </div>
</template>

<script lang="ts">
import * as BG from './BloodGas';
import Vue from 'vue';
export default Vue.extend({
    props: {
        activeChip: String,
        abg: Object,
        results: Object,
    },
});
</script>
