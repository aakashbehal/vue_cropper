<template>
  <!-- <div class="loader" @change="change" @dragover="dragover" @drop="drop"> -->
  <div class="loader" @change="change" style="text-align: center; color: white">
    <p v-show="!loadedStarted">
      <label class="browse">
        <i class="fa fa-camera-retro" style="font-size:42px; color:white"></i> 
        <input class="sr-only" id="file" type="file" accept="image/*">
      </label>
    </p>

    <div style="text-align: center" v-show="loadedStarted">
      <p class="loadgingIn">
        <i class="fa fa-circle-o-notch fa-spin" style="font-size:42px; color:white"></i>
      </p>
    </div>
    <a v-bind:href="currentLocation" data-action="share/whatsapp/share">Share via Whatsapp</a>
  </div>
</template>

<script>
  export default {

    data() {
      return {
        loadedStarted: false,
        currentLocation: `
         Follow this link to get match details
        whatsapp://send?text=${window.location.href}
        `,
      };
    },
    computed: {
      loader() {
        return this.$store.state.loader;
      },
    },
    methods: {
      read(files) {
        return new Promise((resolve, reject) => {
          if (!files || files.length === 0) {
            resolve();
            return;
          }

          const file = files[0];
          if (/^image\/\w+$/.test(file.type)) {
            const reader = new FileReader();
            reader.onload = () => {
              this.$store.dispatch('loader/update', {
                loaded: true,
                name: file.name,
                type: file.type,
                url: reader.result,
              });
              resolve();
            };
            reader.onerror = reject;
            reader.onabort = reject;
            reader.readAsDataURL(file);
          } else {
            this.loadedStarted = false;
            reject('Please choose an image file.');
          }
        });
      },

      change({ target }) {
        // const url = new URL(window.location.href);
        // const c = url.searchParams.get('role');
        this.loadedStarted = true;
        setTimeout(() => {
          this.read(target.files).then(() => {
            target.value = '';
          }).catch((e) => {
            target.value = '';
            this.alert(e);
          });
        }, 10);
      },
      // dragover(e) {
      //   e.preventDefault();
      // },

      // drop(e) {
      //   e.preventDefault();
      //   this.read(e.dataTransfer.files).catch(this.alert);
      // },

      alert(e) {
        window.alert(e && e.message ? e.message : e);
      },
    },
  };

</script>

<style scoped>
  .loader {
    display: table;
    height: 100%;
    overflow: hidden;
    width: 100%;
    & > p {
      color: #999;
      display: table-cell;
      text-align: center;
      vertical-align: middle;
    }
  }
  
  .browse {
    color: #0074d9;
    cursor: pointer;
    margin-left: 4px;
    &:hover {
      color: color(#0074d9 lightness(50%));
      text-decoration: underline;
    }
  }
  
  .sr-only {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    border: 0;
  }
  
  .loadgingIn {
    position: absolute;
    top: 110px;
    z-index: 9999999999999;
    right: 0;
    width: 100%;
    height: 20px;
  }
</style>
