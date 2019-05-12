<template>
  <v-app dark>
    <v-toolbar app>
      <v-toolbar-title class="headline">
        <span>ABG</span>
        <span class="font-weight-light">enius</span>
      </v-toolbar-title>
      <v-spacer></v-spacer>
      <v-btn
        flat
        href="https://github.com/jpoles1/abgenius"
        target="_blank"
      >
        <span class="mr-2">FAQ</span>
        <v-icon>fas fa-question-circle</v-icon>
      </v-btn>
    </v-toolbar>

    <v-content>
      <router-view></router-view>
    </v-content>
  </v-app>
</template>

<script>

export default {
  name: "App",
  components: {},
};
</script>
