<template>
  <v-container>
    <v-form v-model="validABG">
      <center><h2>Patient Demographics</h2></center><br>
      <v-layout text-xs-center wrap justify-center>
        <v-select
          v-model="userBloodGas.abg.patientSex"
          :items='["Male", "Female"]'
          label="Patient Sex"
          outline class="numeric-input"
        ></v-select>
        <v-text-field 
          v-model.number="userBloodGas.abg.patientAge" 
          type="number" label="Patient Age"
          outline class="numeric-input" step="1"
        ></v-text-field>
      </v-layout>
      <center><h2>ABG</h2></center><br>
      <v-layout text-xs-center wrap justify-center>
        <v-tooltip top>
          <template v-slot:activator="{ on }">
            <div v-on="on">
              <v-text-field
                v-model.number="userBloodGas.abg.pH" 
                type="number" label='Serum pH'
                outline class="numeric-input" step="0.01"
                min="0" max="14"
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
              <v-text-field
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
              <v-text-field
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
        <v-tooltip top>
          <template v-slot:activator="{ on }">
            <div v-on="on">
              <v-text-field
                v-model.number="userBloodGas.abg.PaO2" 
                type="number" label='PaO2'
                outline class="numeric-input" step="0.5"
                min="0"
              ></v-text-field>
            </div>
          </template>
          <span>
            Ref Range: {{"(" + adjustedPaO2.lower + " - " + adjustedPaO2.upper + ")"}}
          </span>
        </v-tooltip>
      </v-layout>
      <center><h2>Electrolytes</h2></center><br>
      <v-layout text-xs-center wrap justify-center>
         <v-tooltip top>
          <template v-slot:activator="{ on }">
            <div v-on="on">
              <v-text-field
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
              <v-text-field
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
        <v-tooltip top>
          <template v-slot:activator="{ on }">
            <div v-on="on">
              <v-text-field
                v-model.number="userBloodGas.abg.K" 
                type="number" label='Serum Potassium'
                outline class="numeric-input" step="0.5"
                min="0"
              ></v-text-field>
            </div>
          </template>
          <span>
            Ref Range: {{"(" + refRngs.K.lower + " - " + refRngs.K.upper + ")"}}
          </span>
        </v-tooltip>
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
        <b>Primary:</b>&nbsp;{{primaryDisturbance}}
      </v-chip>
      <v-chip>
        <v-avatar class="warning" v-if='!["Normal", "Unknown"].includes(secondaryDisturbance[0])'>
          <v-icon small v-if='["Respiratory Acidosis", "Respiratory Alkalosis"].includes(secondaryDisturbance[0])'>
            fa-wind
          </v-icon>
          <v-icon small v-else-if='["Metabolic Acidosis", "Metabolic Alkalosis"].includes(secondaryDisturbance[0])'>
            fa-vial
          </v-icon>
        </v-avatar>
        <b>Secondary:</b>&nbsp;{{secondaryDisturbance[1] ? secondaryDisturbance[1] : ''}} {{secondaryDisturbance[0]}}
      </v-chip>
      <v-chip v-if="serumAnionGap[0] != undefined">
        <b>Anion Gap:</b>&nbsp;{{serumAnionGap[0]}}
      </v-chip>
    </v-layout>
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
        refRngs: BG.RefRngs,
        userBloodGas: new BG.BloodGas({
          abg: {
            patientAge: undefined,
            pH: BG.RefRngMidpoint('apH'),
            bicarb: BG.RefRngMidpoint('aBicarb'),
            PaCO2: BG.RefRngMidpoint('PaCO2'),
            PaO2: BG.RefRngMidpoint('PaO2'),
            Na: BG.RefRngMidpoint('Na'),
            K: BG.RefRngMidpoint('K'),
            Cl: BG.RefRngMidpoint('Cl'),
            Albumin: BG.RefRngMidpoint('Albumin'),
          },
        }),
        serumAnionGap: [undefined, BG.DisturbType.Unknown] as [number | undefined, BG.DisturbType],
        adjustedPaO2: {lower: 80, upper: 100} as BG.RefRange,
        o2Disturbance: BG.DisturbType.Normal,
        pHDisturbance: BG.DisturbType.Normal,
        primaryDisturbance: BG.DisturbType.Unknown,
        secondaryDisturbance: [BG.DisturbType.Unknown, undefined],
        tertiaryDisturbance: BG.DisturbType.Unknown,
        inputDebounce: undefined as number | undefined,
      };
    },
    watch: {
      userBloodGas: {
        handler(newVal, oldVal) {
          clearTimeout(this.inputDebounce);
          this.inputDebounce = setTimeout(() => {
            this.updateBloodGas();
          }, 600);
        },
        deep: true,
      },
    },
    methods: {
      updateBloodGas() {
        const urlQuery = Object.assign({}, this.userBloodGas.abg);
        // @ts-ignore
        this.$router.replace({query: urlQuery});
        this.adjustedPaO2 = this.userBloodGas.adjustedPaO2();
        this.o2Disturbance = this.userBloodGas.o2Disturbance();
        this.pHDisturbance = this.userBloodGas.phDisturbance();
        this.primaryDisturbance = this.userBloodGas.guessPrimaryDisturbance();
        this.secondaryDisturbance = this.userBloodGas.guessSecondaryDisturbance();
        this.serumAnionGap = this.userBloodGas.serumAnionGap();
      },
      decodeURL() {
        let urlData = Object.assign({}, this.$route.query);
        urlData = Object.keys(urlData).reduce((agg: any, key: string): any => {
          const numericParsed = parseFloat(urlData[key].toString());
          agg[key] = isNaN(numericParsed) ? urlData[key] : numericParsed;
          return agg;
        }, {});
        Object.assign(this.userBloodGas.abg, urlData);
      },
    },
    mounted() {
      this.$nextTick(() => {
        this.decodeURL();
      });
    },
  });
</script>

<style scpped>
  hr{
    margin: 14px 0px;
  }
  .numeric-input{
    max-width: 220px;
    width: 180px;
    margin: 0px 10px !important;
  }
  .numeric-input.primary--text, .numeric-input .primary--text{
    color: #e7ea78 !important;
    caret-color: #e7ea78 !important;
    border-color: #e7ea78 !important;
  }
  #info-chips .v-chip{
    margin: 14px 12px;
  }
</style>
