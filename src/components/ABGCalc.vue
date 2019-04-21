<template>
  <v-container>
    <v-form v-model="validABG">
      <v-layout text-xs-center wrap justify-space-around>
        <v-select
          v-model="userBloodGas.abg.patientSex"
          :items='["Male", "Female"]'
          label="Patient Sex"
          outline style="max-width: 200px;"
        ></v-select>
        <v-text-field 
          v-model="userBloodGas.abg.patientAge" 
          type="number" label="Patient Age"
          class="numeric-input" step="1"
        ></v-text-field>
      </v-layout>
      <v-layout text-xs-center wrap justify-space-around>
        <v-text-field 
          v-model="userBloodGas.abg.pH" 
          type="number" label="Serum pH"
          class="numeric-input" step="0.01"
          min="0" max="14"
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
        <v-text-field 
          v-model="userBloodGas.abg.PaO2" 
          type="number" label="Serum PaO2"
          class="numeric-input" step="0.5"
        ></v-text-field>
      </v-layout>
    </v-form>
    <hr>
    <v-layout wrap justify-space-around id="info-chips">
      <v-chip>
        <v-avatar class="error" v-if="o2Disturbance != 'Normal'">        
          <v-icon v-if="o2Disturbance == 'Hyperoxemia'">fas fa-arrow-up</v-icon>
          <v-icon v-if="o2Disturbance == 'Hypoxemia'">fas fa-arrow-down</v-icon>
        </v-avatar>
        <v-avatar class="success" v-else>        
          <v-icon small>fas fa-check</v-icon>
        </v-avatar>
        <b>Blood Oxygen:</b>&nbsp;{{o2Disturbance}}
      </v-chip>
      <v-chip>
        <v-avatar class="error" v-if="pHDisturbance != 'Normal'">        
          <v-icon v-if="pHDisturbance == 'Alkalemia'">fas fa-arrow-up</v-icon>
          <v-icon v-if="pHDisturbance == 'Acidemia'">fas fa-arrow-down</v-icon>
        </v-avatar>
        <v-avatar class="success" v-else>        
          <v-icon small>fas fa-check</v-icon>
        </v-avatar>
        <b>Blood pH:</b>&nbsp;{{pHDisturbance}}
      </v-chip>
      <v-chip>
        <v-avatar class="warning" v-if='!["Normal", "Unknown"].includes(primaryDisturbance)'>
          <v-icon small v-if='["Respiratory Acidosis", "Respiratory Alkalosis"].includes(primaryDisturbance)'>
            fa-wind
          </v-icon>
          <v-icon small v-else-if='["Metabolic Acidosis", "Metabolic Alkalosis"].includes(primaryDisturbance)'>
            fa-vial
          </v-icon>
        </v-avatar>
        <b>Primary Disturbance:</b>&nbsp;{{primaryDisturbance}}
      </v-chip>
      <v-chip>
        <b>Secondary Disturbance:</b>&nbsp;{{secondaryDisturbance}}
      </v-chip>
    </v-layout>
    <hr>
    {{userBloodGas}}
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
        validABG: true,
        userBloodGas: new BG.BloodGas({
          abg: {
            pH: BG.RefRngMidpoint('apH'),
            bicarb: BG.RefRngMidpoint('aBicarb'),
            PaCO2: BG.RefRngMidpoint('PaCO2'),
            PaO2: BG.RefRngMidpoint('PaO2'),
          },
        }),
        o2Disturbance: BG.DisturbType.Normal,
        pHDisturbance: BG.DisturbType.Normal,
        primaryDisturbance: BG.DisturbType.Unknown,
        secondaryDisturbance: BG.DisturbType.Unknown,
        tertiaryDisturbance: BG.DisturbType.Unknown,
      };
    },
    watch: {
      userBloodGas: {
        handler(newVal, oldVal) {
          const urlQuery = Object.assign({}, this.userBloodGas.abg);
          // @ts-ignore
          this.$router.replace({query: urlQuery});
          this.o2Disturbance = this.userBloodGas.o2Disturbance();
          this.pHDisturbance = this.userBloodGas.phDisturbance();
          this.primaryDisturbance = this.userBloodGas.guessPrimaryDisturbance();
        },
        deep: true,
      },
    },
    mounted() {
      this.$nextTick(() => {
        Object.assign(this.userBloodGas.abg, this.$route.query);
      });
    },
  });
</script>

<style>
  hr{
    margin: 14px 0px;
  }
  .numeric-input{
    max-width: 220px;
    margin: 0px 10px;
  }
  #info-chips .v-chip{
    margin: 12px 12px;
  }
</style>
