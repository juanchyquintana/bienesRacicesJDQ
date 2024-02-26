import { Dropzone } from "dropzone";

const token = document
  .querySelector('meta[name="csrf-token"]')
  .getAttribute("content");

Dropzone.options.imagen = {
  dictDefaultMessage: "Sube tus imágenes aquí",
  acceptedFiles: ".png, .jpg, .jpeg",
  maxFilesize: 5,
  maxFiles: 1,
  parallelUploads: 1,
  autoProcessQueue: false,
  addRemoveLinks: true,
  dictRemoveFile: "Borrar Archivo",
  dictMaxFilesExceeded: "La Cantidad es un Archivo",
  headers: {
    "CSRF-Token": token,
  },
  paramName: "imagen",
  init: function () {
    const dropzone = this;
    const botonPublicar = document.querySelector("#publicar");

    botonPublicar.addEventListener("click", function() {
      dropzone.processQueue();
    });

    dropzone.on('queuecomplete', function(file, mensaje) {
      if(dropzone.getActiveFiles().length == 0) {
        setTimeout(() => {
          window.location.href = '/mis-propiedades'
        }, 1000);
      }
    })
  },
};
