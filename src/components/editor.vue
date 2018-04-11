<template>
  <div class="editor">
    <div class="canvas" @dblclick="dblclick"  v-bind:class="{ portrait: orientation === 1 }">
      <img ref="image" :alt="loader.name" :src="loader.url" @load="start">
      <div style="text-align: center"><p class="loadgingIn" v-show="loadingCheck && !editor.cropped"><i class="fa fa-circle-o-notch fa-spin" style="font-size:42px"></i></p></div>
      <div style="text-align: center"><p class="loadgingIn" v-show="loadingCheckInner && !editor.cropped"><i class="fa fa-circle-o-notch fa-spin" style="font-size:42px"></i></p></div>
    </div>
    
    <!--<div style="text-align: center; color: white; position: absolute" v-if="loadingCheck && !editor.cropped">Loading...</div>-->
    <div class="toolbar" v-show="cropper" @click="click">
      
      <!--<div style="text-align: center"><p class="loadgingIn" v-if="loadingCheckInner">Loading...</p></div>-->
      <!-- <button class="toolbar__button" data-action="move" title="Move (M)"><span class="fa fa-arrows"></span></button> -->
      <!--<button class="toolbar__button" data-action="crop" title="Crop (C)"><span class="fa fa-crop"></span></button>-->
      <!-- <button class="toolbar__button" data-action="zoom-out" title="Zoom Out (O)"><span class="fa fa-search-minus"></span></button> -->
      <button class="toolbar__button" data-action="rotate-left" title="Rotate Left (L)"><span class="fa fa-rotate-left"></span></button>
      <button class="toolbar__button" data-action="crop-save" title="OK (Enter)"><span class="fa fa-check"></span></button>
      <button class="toolbar__button" data-action="rotate-right" title="Rotate Right (R)"><span class="fa fa-rotate-right"></span></button>

      <!-- <button class="toolbar__button" data-action="flip-horizontal" title="Flip Horizontal (H)"><span class="fa fa-arrows-h"></span></button> -->
      <!-- <button class="toolbar__button" data-action="flip-vertical" title="Flip Vertical (V)"><span class="fa fa-arrows-v"></span></button> -->
    </div>
    <div class="toolbar_remove" v-show="!cropper" @click="click">
    <!--<button type="button" class="toolbar__button" data-action="restore" title="Undo (Ctrl + Z)" v-show="editor.cropped"><span class="fa fa-undo"></span></button>-->
      <button type="button" class="toolbar__button" data-action="remove" v-show="editor.cropped" title="Delete (Delete)"><span class="fa fa-trash"></span></button>
    </div>
    
  </div>
</template>

<script>
  import Cropper from 'cropperjs';

  export default {
    data() {
      return {
        cropper: null,
        canvasData: null,
        cropBoxData: null,
        data: null,
        orientation: null,
        loadingCheck: true,
        loadingCheckInner: false,
      };
    },

    computed: {
      editor() {
        return this.$store.state.editor;
      },
      loader() {
        window.onresize = () => {
          this.applyOrientation(false);
        };
        return this.$store.state.loader;
      },
    },
    created() {
      this.applyOrientation(true);
    },

    mounted() {
    },

    beforeDestroy() {
      this.stop();
    },

    methods: {
      click({ target }) {
        const cropper = this.cropper;
        const action = target.dataset.action || target.parentNode.dataset.action;
        switch (action) {
          case 'move':
          case 'crop':
            cropper.setDefaults({ autoCrop: true });
            break;
          // case 'zoom-in':
          //   cropper.zoom(0.1);
          //   break;

          // case 'zoom-out':
          //   cropper.zoom(-0.1);
          //   break;
          case 'rotate-left':
            this.clear();
            cropper.rotate(-90);
            cropper.crop();
            // cropper.setDragMode('crop');
            break;
          case 'rotate-right':
            this.clear();
            cropper.rotate(90);
            cropper.crop();
            break;
          case 'remove':
            this.reset();
            break;
          case 'crop-save':
            this.loadingCheckInner = true;
            setTimeout(() => {
              this.crop();
            }, 100);
            break;
          case 'restore':
            this.restore();
            break;
          // case 'flip-horizontal':
          //   cropper.scaleX(-cropper.getData().scaleX || -1);
          //   break;

          // case 'flip-vertical':
          //   cropper.scaleY(-cropper.getData().scaleY || -1);
          //   break;

          default:
        }
      },

      // keydown(e) {
      //   switch (e.key) {
      //     // Undo crop
      //     case 'z':
      //       if (e.ctrlKey) {
      //         e.preventDefault();
      //         this.restore();
      //       }

      //       break;

      //     // Delete the image
      //     case 'Delete':
      //       this.reset();
      //       break;

      //     default:
      //   }

      //   const cropper = this.cropper;

      //   if (!cropper) {
      //     return;
      //   }

      //   switch (e.key) {
      //     // Crop the image
      //     case 'Enter':
      //       this.crop();
      //       break;

      //     // Clear crop area
      //     case 'Escape':
      //       this.clear();
      //       break;

      //     // Move to the left
      //     case 'ArrowLeft':
      //       e.preventDefault();
      //       cropper.move(-1, 0);
      //       break;

      //     // Move to the top
      //     case 'ArrowUp':
      //       e.preventDefault();
      //       cropper.move(0, -1);
      //       break;

      //     // Move to the right
      //     case 'ArrowRight':
      //       e.preventDefault();
      //       cropper.move(1, 0);
      //       break;

      //     // Move to the bottom
      //     case 'ArrowDown':
      //       e.preventDefault();
      //       cropper.move(0, 1);
      //       break;

      //     // Enter crop mode
      //     case 'c':
      //       cropper.setDragMode('crop');
      //       break;

      //     // Enter move mode
      //     case 'm':
      //       cropper.setDragMode('move');
      //       break;

      //     // Zoom in
      //     case 'i':
      //       cropper.zoom(0.1);
      //       break;

      //     // Zoom out
      //     case 'o':
      //       cropper.zoom(-0.1);
      //       break;

      //     // Rotate left
      //     case 'l':
      //       cropper.rotate(-90);
      //       break;

      //     // Rotate right
      //     case 'r':
      //       cropper.rotate(90);
      //       break;

      //     // Flip horizontal
      //     case 'h':
      //       cropper.scaleX(-cropper.getData().scaleX || -1);
      //       break;

      //     // Flip vertical
      //     case 'v':
      //       cropper.scaleY(-cropper.getData().scaleY || -1);
      //       break;

      //     default:
      //   }
      // },

      applyOrientation(flag) {
        if (flag) {
          this.clear();
        }
        if (window.innerHeight > window.innerWidth) {
          this.orientation = 0;
        } else {
          this.orientation = 1;
        }
      },

      dblclick(e) {
        if (e.target.className.indexOf('cropper-face') >= 0) {
          e.preventDefault();
          e.stopPropagation();
          this.crop();
        }
      },
      start() {
        this.loadingCheck = true;
        const editor = this.editor;
        if (editor.cropped) {
          return;
        }

        this.cropper = new Cropper(this.$refs.image, {
          autoCrop: true,
          dragMode: false,
          aspectRatio: 0,
          movable: false,
          scalable: false,
          zoomable: false,
          viewMode: 1,
          autoCropArea: 0.6,
          background: false,
          minCropBoxWidth: 100,
          minCropBoxHeight: 100,
          center: true,
          ready: () => {
            this.loadingCheck = false;
            if (this.data) {
              this.cropper
                .crop()
                .setData(this.data)
                .setCanvasData(this.canvasData)
                .setCropBoxData(this.cropBoxData);
              this.data = null;
              this.canvasData = null;
              this.cropBoxData = null;
            }
          },
          crop: ({ detail }) => {
            if (detail.width > 0 && detail.height > 0 && !editor.cropping) {
              this.$store.dispatch('editor/update', {
                cropping: true,
              });
            }
          },
        });
      },

      stop() {
        this.loadingCheckInner = true;
        if (this.cropper) {
          this.cropper.destroy();
          this.cropper = null;
          this.$store.dispatch('editor/update', {
            cropping: false,
          });
        }
      },

      crop() {
        const cropper = this.cropper;
        // const {  } = this.loader;
        const { type, url } = this.loader;
        if (this.editor.cropping) {
          this.data = cropper.getData();
          this.canvasData = cropper.getCanvasData();
          this.cropBoxData = cropper.getCropBoxData();
          this.data = cropper.getData();
          this.$store.dispatch('editor/update', {
            cropped: true,
            cropping: false,
          });
          this.$store.dispatch('loader/update', {
            previousUrl: url,
            url: cropper.getCroppedCanvas().toDataURL(type),
          });
          // const that = this;
          setTimeout(() => {
            this.stop();
          });
          window.parent.postMessage(url, '*');
          this.clear();
        }
      },

      clear() {
        if (this.editor.cropping) {
          this.cropper.clear();
          this.$store.dispatch('editor/update', {
            cropping: false,
          });
        }
      },

      restore() {
        if (this.editor.cropped) {
          this.$store.dispatch('editor/update', {
            cropped: false,
          });
          this.$store.dispatch('loader/update', {
            previousUrl: '',
            url: this.loader.previousUrl,
          });
        }
      },

      reset() {
        this.stop();
        this.$store.dispatch('editor/remove');
        this.$store.dispatch('loader/remove');
      },
    },
  };
</script>

<style scoped>
  .editor {
    height: 100%;
    position: relative
  }

  .portrait{
    height: 300px !important;
    width: 300px !important;
  }

  .canvas {
    position: relative;
    align-items: center;
    display: flex;
    height: 360px;
    width: 360px;
    margin: 0 auto;
    justify-content: center;

    & > img {
      max-height: 100%;
      max-width: 100%;
    }
  }

  .toolbar {
    background-color: rgba(0, 0, 0, .5);
    bottom: 16px;
    color: #fff;
    height: 60px;
    /*left: 46%;*/
    /*margin-left: -64px;*/
    /*position: absolute;*/
    /*width: 256px;*/
    /*z-index: 2015;*/
    width: 210px;
    display: block;
    margin: 10px auto 0;
    
    &__button {
      background-color: transparent;
      border-width: 0;
      color: #fff;
      cursor: pointer;
      display: block;
      float: left;
      height: 60px;
      text-align: center;
      width: 70px;

      &:focus {
        outline: none;
      }

      &:hover {
        background-color: #0074d9;
        color: #fff;
      }
      
    }
  }
  .toolbar_remove {
    background-color: rgba(0, 0, 0, .5);
    bottom: 16px;
    color: #fff;
    height: 60px;
    /*left: 50%;*/
    /*margin-left: -64px;*/
    /*position: absolute;*/
    /*width: 256px;*/
    /*z-index: 2015;*/
    width: 70px;
    display: block;
    margin: 10px auto 0;
    
    &__button {
      background-color: transparent;
      border-width: 0;
      color: #fff;
      cursor: pointer;
      display: block;
      float: left;
      height: 60px;
      text-align: center;
      width: 70px;

      &:focus {
        outline: none;
      }

      &:hover {
        background-color: #0074d9;
        color: #fff;
      }
      
    }
  }
  @media screen and (max-width: 480px){
    .toolbar{
      left: 40%
    }
    .toolbar_remove{
      left:55%
    }
  }
  .loadgingIn{
    position: absolute;
    top: 110px;
    color: white;
    z-index: 9999999999999;
    right: 0;
    width: 100%;
    height: 20px;
  }
  
</style>
