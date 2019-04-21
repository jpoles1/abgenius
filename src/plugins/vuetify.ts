import Vue from 'vue';
import Vuetify from 'vuetify';
import 'vuetify/src/stylus/app.styl';

Vue.use(Vuetify, {
  iconfont: 'fa',
  theme: {
    'primary': '#1976D2',
    'secondary': '#424242',
    'accent': '#009688',
    'error': '#FF5252',
    'info': '#ffc107',
    'success': '#4CAF50',
    'warning': '#FB8C00',
  },
});
