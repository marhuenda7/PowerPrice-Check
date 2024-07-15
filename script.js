"use strict";


// Definimos los electrodomésticos y su consumo en vatios
const electrodomesticos = {
    ordenador: 150,
    nevera: 100,
    calefactor: 2000,
    // Añade aquí más electrodomésticos si lo deseas
  };

  // Obtenemos la fecha actual
  const fechaActual = new Date();
  const diaActual = fechaActual.getDate();
  const horaActual = fechaActual.getHours();

  // Comprobamos si ya hemos hecho una petición a la API hoy
  const datosGuardados = JSON.parse(localStorage.getItem('datosLuz'));
  if (datosGuardados && datosGuardados.dia === diaActual) {
    calcularCostos(datosGuardados.datos);
  } else {
    // Si no, hacemos una nueva petición
    fetch('https://bypass-cors-beta.vercel.app/?url=https://api.preciodelaluz.org/v1/prices/all?zone=PCB')
      .then(response => response.json())
      .then(data => {
        // Guardamos los datos en el LocalStorage
        localStorage.setItem('datosLuz', JSON.stringify({ dia: diaActual, datos: data }));
        calcularCostos(data);
      });
  }

  function calcularCostos(datos) {
    // Obtenemos el precio actual de la luz
    const precioActual = datos[horaActual].price;

    // Calculamos y mostramos el costo de cada electrodoméstico
    for (let [nombre, vatios] of Object.entries(electrodomesticos)) {
      const costo = (vatios / 1000) * precioActual; // Convertimos vatios a kilovatios y multiplicamos por el precio
      console.log(El costo de tener un ${nombre} encendido durante una hora es de ${costo.toFixed(2)}€);
    }
  }