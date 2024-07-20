"use strict";

// Definición de los electrodomésticos y su consumo en vatios
const electrodomesticos = {
  ordenador: 100,
  nevera: 150,
  radiador: 1000,
  cocina: 2000,
  lavadora: 500,
  // añade aquí más electrodomésticos si lo deseas
};

// Función para obtener los datos de la API
async function obtenerDatosAPI() {
  try {
    const respuesta = await fetch(
      "https://bypass-cors-beta.vercel.app/?url=https://api.preciodelaluz.org/v1/prices/all?zone=PCB"
    );
    const datos = await respuesta.json();
    guardarDatosLocalStorage(datos);
    console.log(datos);
    return datos;
  } catch (err) {
    console.error(err.message);
  }
}

// Función para guardar los datos en el LocalStorage
function guardarDatosLocalStorage(datos) {
  const fecha = new Date().toISOString().split('T')[0]; // obtenemos la fecha actual
  localStorage.setItem('datosPrecioLuz', JSON.stringify(datos));
  localStorage.setItem('fechaDatos', fecha);
}

// Función para calcular el costo de funcionamiento de los electrodomésticos
function calcularCosto(electrodomesticos, precio) {
  const costos = {};
  for (const [aparato, vatios] of Object.entries(electrodomesticos)) {
    const costo = (vatios / 1000) * precio; // convertimos vatios a kilovatios y multiplicamos por el precio
    costos[aparato] = costo.toFixed(2); // guardamos el costo con dos decimales
  }
  return costos;
}

// Función para calcular el precio máximo y la hora correspondiente
function obtenerPrecioMaximo(datos) {
  const entradas = Object.entries(datos.data);
  let [horaMaxima, infoMaxima] = entradas[0];
  let precioMaximo = infoMaxima.price;
  
  for (const [hora, info] of entradas) {
    if (info.price > precioMaximo) {
      precioMaximo = info.price;
      horaMaxima = hora;
    }
  }
  return { precio: precioMaximo, hora: horaMaxima };
}

// Función para calcular el precio mínimo y la hora correspondiente
function obtenerPrecioMinimo(datos) {
  const entradas = Object.entries(datos.data);
  let [horaMinima, infoMinima] = entradas[0];
  let precioMinimo = infoMinima.price;

  for (const [hora, info] of entradas) {
    if (info.price < precioMinimo) {
      precioMinimo = info.price;
      horaMinima = hora;
    }
  }
  return { precio: precioMinimo, hora: horaMinima };
}

// Función para calcular la media de los precios
function obtenerMediaPrecios(datos) {
  const precios = Object.values(datos.data).map(entry => entry.price);
  const suma = precios.reduce((total, precio) => total + precio, 0);
  return (suma / precios.length).toFixed(2);
}

// Función principal
async function main() {
  let datos = JSON.parse(localStorage.getItem("datosPrecioLuz"));
  if (!datos) {
    datos = await obtenerDatosAPI();
    console.log('Sin datos');
  } else {
    const fechaActual = new Date().toISOString().split("T")[0];
    const fechaDatos = localStorage.getItem("fechaDatos");
    console.log(fechaActual, fechaDatos);
    if (fechaDatos === fechaActual) {
      datos = JSON.parse(localStorage.getItem("datosPrecioLuz"));
      console.log('Mismo día');
    } else {
      datos = obtenerDatosAPI();
      console.log('Distinto día');
    }
  }
  
  // Obtenemos el precio actual
  const horaActual = new Date().getHours();
  const horaActualStr = horaActual.toString().padStart(2, '0') + '-' + (horaActual + 1).toString().padStart(2, '0');
  const precioActual = datos.data[horaActualStr].price;
  console.log(horaActualStr);
  console.log(precioActual);

  // Calculamos los costos
  const costos = calcularCosto(electrodomesticos, precioActual);

  // Mostramos los costos
  for (const [aparato, costo] of Object.entries(costos)) {
    console.log(`El costo de funcionamiento de un ${aparato} durante una hora es de ${costo}€.`);
  }

  // Calculamos y mostramos el precio máximo, mínimo y la media
  const { precio: precioMaximo, hora: horaMaxima } = obtenerPrecioMaximo(datos);
  const { precio: precioMinimo, hora: horaMinima } = obtenerPrecioMinimo(datos);
  const mediaPrecios = obtenerMediaPrecios(datos);
  
  //convertimos la cadena de texto en numeros con parseFloat para hacerlo accesible a los calculos del boton
  let numeroMediaPrecios = parseFloat(mediaPrecios);

  document.getElementById("horaMenor").textContent = (`${horaMinima}`)
  document.getElementById("precioMenor").textContent = (`${precioMinimo} €/MWh`)

  document.getElementById("precioMedio").textContent = (`${mediaPrecios} €/MWh`)

  document.getElementById("horaMayor").textContent = (`${horaMaxima}`)
  document.getElementById("precioMayor").textContent = (`${precioMaximo} €/MWh`)

  console.log(`El precio máximo de la luz es ${precioMaximo}€ a las ${horaMaxima}.`);
  console.log(`El precio mínimo de la luz es ${precioMinimo}€ a las ${horaMinima}.`);
  console.log(`La media de los precios de la luz es ${mediaPrecios}€.`);

  
}

main();

let electricItems = document.querySelectorAll("button");
console.log(electricItems);

const activePrompt = Array.from(electricItems).forEach((item) => {
  item.addEventListener("click", () => {
    let ventana = parseInt(prompt(`Ingresa el consumo de tu ${[item.id]}`));
    if (isNaN(ventana)) {
      alert(
        "Formato incorrecto. Por favor introduce solo la cantidad numérica"
      );
    } else if (ventana !== null) {
      // Si el usuario no presiona "Cancelar"
      item.querySelector(".result").textContent = `Tu consumo es: ${ventana}`;
    } else {
      item.querySelector(".result").textContent =
        "No se ingresó ningún mensaje.";
    }
    return 'result'
  });
});
let calcularConsumo = function(ventana, mediaPrecios) {
  return ventana * mediaPrecios;
}