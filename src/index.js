import 'normalize.css';
import 'font-awesome/css/font-awesome.min.css';
import './cropper.css';
import 'babel-polyfill';

import Vue from 'vue';
import App from './app.vue';
import store from './store';
import './components';

new Vue({
  store,
  el: '#app',
  render: createElement => createElement(App),
});
