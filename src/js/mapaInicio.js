(function () {
  const lat = -26.8301695;
  const lng = -65.2044388;
  const mapa = L.map("mapa-inicio").setView([lat, lng], 13);

  let markers = new L.FeatureGroup().addTo(mapa);
  let propiedades = [];

  const filtros = {
    categorias: "",
    precios: "",
  };

  const categoriasSelect = document.querySelector("#categorias");
  const preciosSelect = document.querySelector("#precios");

  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  }).addTo(mapa);

  // Filtrado
  categoriasSelect.addEventListener("change", (e) => {
    filtros.categorias = +e.target.value;
    filtrarPropiedades();
  });

  preciosSelect.addEventListener("change", (e) => {
    filtros.precios = +e.target.value;
    filtrarPropiedades();
  });

  const obtenerPropiedades = async () => {
    try {
      const url = "/api/propiedades";
      const respuesta = await fetch(url);
      propiedades = await respuesta.json();

      mostrarPropiedades(propiedades);
    } catch (error) {
      console.log(error);
    }
  };

  const mostrarPropiedades = (propiedadaes) => {
    // Limpiar markers previos
    markers.clearLayers()

    propiedadaes.forEach((propiedad) => {
      // Agregar Pines
      const marker = new L.marker([propiedad?.lat, propiedad?.lng], {
        autoPan: true,
      }).addTo(mapa).bindPopup(`
        <p class="text-indigo-600 font-bold">${propiedad.categoria.nombre}</p>
        <h1 class="text-xl font-extrabold uppercase my-5">${propiedad?.titulo}</h1>
        <img src="/uploads/${propiedad?.imagen}" alt="Imagen de la propiedad ${propiedad?.titulo}">
        <p class="text-gray-600 font-bold">${propiedad.precio.nombre}</p>
        <a href="/propiedad/${propiedad.id}" class="bg-indigo-600 block p-2 text-center font-bold uppercase">Ver Propiedad</a>

      `);

      markers.addLayer(marker);
    });
  };

  const filtrarPropiedades = () => {
    const resultado = propiedades
      .filter(filtrarCategoria)
      .filter(filtrarPrecios);

      mostrarPropiedades(resultado)
  };

  const filtrarCategoria = (propiedad) =>
    filtros.categorias
      ? propiedad.categoriaId === filtros.categorias
      : propiedad;

  const filtrarPrecios = (propiedad) =>
    filtros.precios ? propiedad.precioId === filtros.precios : propiedad;

  obtenerPropiedades();
})();
