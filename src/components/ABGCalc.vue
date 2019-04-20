<template>
  <v-container>
    <v-layout text-xs-center wrap>
      {{userBloodGas}}
      <v-text-field 
        v-model="userBloodGas.pH" 
        type="number" label="Number"
      ></v-text-field>
      <hr>
    </v-layout>
    <ReferenceList/>
  </v-container>
</template>

<script lang="ts">
  import * as BG from './BloodGas';
  import ReferenceList from './ReferenceList.vue';

  export default {
    components: {
      ReferenceList,
    },
    data() {
      return {
        userBloodGas: {} as BG.BloodGas,
      };
    },
    methods: {
    },
  };
</script>

<style>

</style>
