<template>
  <div class="home">
    <ABGCalc/>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";
import ABGCalc from "@/components/ABGCalc.vue"; // @ is an alias to /src

@Component({
  components: {
    ABGCalc,
  },
})
export default class Home extends Vue {}
</script>
