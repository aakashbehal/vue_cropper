<template>
  <div class="editor">
    <div class="canvas" @dblclick="dblclick"  v-bind:class="{ portrait: orientation === 1 }">
      <img ref="image" :alt="loader.name" :src="loader.url" @load="start">
    </div>
    <div class="toolbar" v-if="editor.cropping" @click="click">
      <!-- <button class="toolbar__button" data-action="move" title="Move (M)"><span class="fa fa-arrows"></span></button> -->
      <button class="toolbar__button" data-action="crop" title="Crop (C)"><span class="fa fa-crop"></span></button>
      <!-- <button class="toolbar__button" data-action="zoom-out" title="Zoom Out (O)"><span class="fa fa-search-minus"></span></button> -->
      <button class="toolbar__button" data-action="rotate-left" title="Rotate Left (L)"><span class="fa fa-rotate-left"></span></button>
      <button class="toolbar__button" data-action="crop-save" title="OK (Enter)"><span class="fa fa-check"></span></button>
      <button class="toolbar__button" data-action="rotate-right" title="Rotate Right (R)"><span class="fa fa-rotate-right"></span></button>

      <!-- <button class="toolbar__button" data-action="flip-horizontal" title="Flip Horizontal (H)"><span class="fa fa-arrows-h"></span></button> -->
      <!-- <button class="toolbar__button" data-action="flip-vertical" title="Flip Vertical (V)"><span class="fa fa-arrows-v"></span></button> -->
    </div>
    <div class="toolbar_remove" v-if="editor.cropped" @click="click">
    <!--<button type="button" class="toolbar__button" data-action="restore" title="Undo (Ctrl + Z)" v-show="editor.cropped"><span class="fa fa-undo"></span></button>-->
      <button type="button" class="toolbar__button" data-action="remove" title="Delete (Delete)"><span class="fa fa-trash"></span></button>
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
      // window.addEventListener('keydown', (this.onKeydown = this.keydown.bind(this)));
    },

    beforeDestroy() {
      // window.removeEventListener('keydown', this.onKeydown);
      this.stop();
    },

    methods: {
      click({ target }) {
        const cropper = this.cropper;
        const action = target.dataset.action || target.parentNode.dataset.action;
        switch (action) {
          case 'move':
          case 'crop':
            cropper.setDragMode(action);
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
            break;
          case 'rotate-right':
            this.clear();
            cropper.rotate(90);
            break;
          case 'remove':
            this.reset();
            break;
          case 'crop-save':
            this.crop();
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
            url: cropper.getCroppedCanvas(type === 'image/png' ? null : {
              fillColor: '#fff',
            }).toDataURL(type),
          });
          // const that = this;
          setTimeout(() => {
            this.stop();
          });
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
  }

  .portrait{
    height: 300px !important;
    width: 300px !important;
  }

  .canvas {
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
    width: 280px;
    display: block;
    margin: 0 auto;
    
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
    margin: 0 auto;
    
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
</style>
