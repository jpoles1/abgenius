<template>
  <v-container>
    <v-layout text-xs-center wrap justify-space-around>
      <v-text-field 
        v-model="userBloodGas.abg.pH" 
        type="number" label="Serum pH"
        class="numeric-input" step="0.01"
      ></v-text-field>
      <v-text-field 
        v-model="userBloodGas.abg.bicarb" 
        type="number" label="Serum Bicarb"
        class="numeric-input" step="0.5"
      ></v-text-field>
      <v-text-field 
        v-model="userBloodGas.abg.PaCO2" 
        type="number" label="Serum PaCO2"
        class="numeric-input" step="0.5"
      ></v-text-field>
    </v-layout>
    <hr>
    <b>Primary Disturbance:</b> {{primaryDisturbance}}
    <hr>
    <br>
    <ReferenceList/>
  </v-container>
</template>

<script lang="ts">
  import * as BG from './BloodGas';
  import ReferenceList from './ReferenceList.vue';

  import Vue from 'vue';
  export default Vue.extend({
    components: {
      ReferenceList,
    },
    data() {
      return {
        userBloodGas: {
          abg: {
            pH: BG.RefRngMidpoint('apH'),
            bicarb: BG.RefRngMidpoint('aBicarb'),
            PaCO2: BG.RefRngMidpoint('PaCO2'),
          },
        } as BG.BloodGas,
        primaryDisturbance: BG.DisturbType.Unknown,
        secondaryDisturbance: BG.DisturbType.Unknown,
        tertiaryDisturbance: BG.DisturbType.Unknown,
      };
    },
    watch: {
      userBloodGas() {
        this.primaryDisturbance = this.userBloodGas.guessPrimaryDisturbance();
      },
    },
  });
</script>

<style>
  .numeric-input{
    max-width: 260px;
  }
</style>
