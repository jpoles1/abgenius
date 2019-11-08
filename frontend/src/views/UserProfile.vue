<template>
    <div>
      <headful title="ABGenius - Profile"/>
      <v-card style="margin: 30px auto; max-width: 660px; padding: 16px;">
        <h1>Learner Profile</h1>
        <v-divider />
        <b style="font-size: 145%">What is your current level of training?</b>
        <div style="display: flex; font-size: 22px; margin-top: 16px;" class="learner-profile-input">
          <v-select v-model="learnerLevel" :items="TrainingLevels" style="max-width: 240px; font-size:22px" outline/>
          <div style="margin: 0 12px; font-size: 28px; padding-top: 6px;">year</div>
          <v-text-field type="number" min=1 max=99 v-model="learnerLevelYears" style="max-width: 90px; font-size:22px" outline class="learner-year"/>
        </div>
      </v-card>
    </div>
</template>

<script lang="ts">
    import Vue from "vue";
    import { TrainingLevels, LearnerProfile } from "@/components/LearnerProfile";
    export default Vue.extend({
        data() {
          return {
            TrainingLevels,
          }
        }
    });
</script>

<style>
  .learner-profile-input .v-select__selections {
    padding-top: 2px !important;
  }
  .learner-year input {
    margin-top: 10px !important;
    text-align: center;
  }
</style>