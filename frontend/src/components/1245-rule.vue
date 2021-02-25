<template>
    <div>
        <span class="title" @click="visible = !visible">
            <span v-show="!visible">Learn the</span>
            1-2-<span class="strikediag">3</span>-4-5 Rule
        </span>
        <div v-show="visible">
            <table>
                <tr class="header">
                    <td style="border: none"></td>
                    <td colspan=2>Expected<br>&Delta; [&nbsp;HCO<sub>3</sub><sup>-</sup>&nbsp;]</td>
                </tr>
                <tr class="header">
                    <td>For every 10<br>of &Delta;P<sub>a</sub>CO<sub>2</sub></td>
                    <td>Acute</td>
                    <td>Chronic</td>
                </tr>
                <tr>
                    <td>
                        Resp. Acidosis
                        <br>
                        <i><b><u>A</u></b>cidic</i>
                    </td>
                    <td>+1</td>
                    <td>+4</td>
                </tr>
                <tr>
                    <td>
                        Resp. Alkalosis
                        <br>
                        <i><b><u>B</u></b>asic</i>
                    </td>
                    <td>-2</td>
                    <td>-5</td>
                </tr>
            </table>
            <div style="max-width: 500px; font-style: italic; font-size: 80%;">
                For every change of 10 in the P<sub>a</sub>CO<sub>2</sub>, we expect the [&nbsp;HCO<sub>3</sub><sup>-</sup>&nbsp;] to compensate by the above values.
                <br>
                Note: herein we classiy only chronic compensation as complete metabolic compensation.
            </div> 
        </div>
    </div>
</template>

<script lang="ts">
import Vue from 'vue'
export default Vue.extend({
    data() {
        return {
            visible: false,
        }
    }
})
</script>

<style scoped>
    .title {
        font-size: 140%;
        transition: 0.5s ease;
        border-bottom: 1px solid #ffffff55;
        width: auto;
        cursor: pointer
    }
    .title:hover {
        border-bottom: 1px solid white;
    }
    table {
        text-align: center;
        border: 1px solid #ccc;
        margin-top: 10px;
        margin-bottom: 15px;
        border-collapse: collapse;
    }
    td {
        border: 2px solid #ccc;
        padding: 5px;
    }
    .header {
        font-weight: bold;
    }
    .strikediag {
        background: linear-gradient(to left top, transparent 46%, currentColor 48%, currentColor 55%, transparent 56%);
    }

</style>