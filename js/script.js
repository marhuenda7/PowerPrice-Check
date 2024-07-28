"use strict";

// Definición de los electrodomésticos y su consumo en vatios predeterminados en localStorage


if (localStorage.getItem('electroStorage') === null){
  let consumidores = {
    ordenador: 100,
    nevera: 150,
    calefaccion: 1000,
    cocina: 2000,
    lavadora: 500,
  };
  localStorage.setItem('electroStorage', JSON.stringify(consumidores));
} 
const electrodomesticos = JSON.parse(localStorage.getItem('electroStorage'));
// Función para obtener los datos de la API
async function obtenerDatosAPI() {
  try {
    const respuesta = await fetch(
      "https://bypass-cors-beta.vercel.app/?url=https://api.preciodelaluz.org/v1/prices/all?zone=PCB"
    );
    if (!respuesta.ok) {
      throw new Error(`HTTP error! status: ${respuesta.status}`);
    }
    const datos = await respuesta.json();
    console.log('Datos obtenidos de la API:', datos);
    guardarDatosLocalStorage(datos.data);
    mostrarPreciosPorHora(datos.data);
    return datos.data;
  } catch (err) {
    console.error('Error al obtener datos de la API:', err.message);
    return null;
  } 
}
//Función para sacar los datos de precio por cada hora
function mostrarPreciosPorHora(datos) {
  console.log('Mostrando precios por hora:', datos);
  Object.entries(datos).forEach(([hora, detalle]) => {
    if (detalle && typeof detalle === 'object') {
      console.log(`Hora: ${hora}, Precio: ${detalle.price}`);
    } else {
      console.error('Detalle inválido para hora:', hora, detalle);
    }
  });
}

// Función para guardar los datos en el LocalStorage
function guardarDatosLocalStorage(datos) {
  const fecha = new Date().toISOString().split('T')[0]; // obtenemos la fecha actual
  localStorage.setItem('datosPrecioLuz', JSON.stringify(datos));
  localStorage.setItem('fechaDatos', fecha);
}

// Función para calcular el costo de funcionamiento de los electrodomésticos
function calcularCosto(electrodomesticos, precioMwh) {
  const costos = {};
  const precioKwh = precioMwh / 1000;
  for (const [aparato, vatios] of Object.entries(electrodomesticos)) {
    const costoKwh = (vatios / 1000) * precioKwh; // convertimos vatios a kilovatios y multiplicamos por el precio
    costos[aparato] = costoKwh.toFixed(3); // guardamos el costo con dos decimales
  }
  return costos;
}

// Función para calcular el precio máximo y la hora correspondiente
function obtenerPrecioMaximo(datos) {
  if (!datos) return { precioMwh: null, precioKwh: null, hora: null };
  const entradas = Object.entries(datos);
  let [horaMaxima, infoMaxima] = entradas[0];
  let precioMaximoMwh = infoMaxima.price;
  
  for (const [hora, info] of entradas) {
    if (info.price > precioMaximoMwh) {
      precioMaximoMwh = info.price;
      horaMaxima = hora;
    }
  }
  const precioMaximoKwh = (precioMaximoMwh / 1000).toFixed(3);
  return { precioMwh: precioMaximoMwh, precioKwh: precioMaximoKwh, hora: horaMaxima };
}

// Función para calcular el precio mínimo y la hora correspondiente
function obtenerPrecioMinimo(datos) {
  if (!datos) return { precioMwh: null, precioKwh: null, hora: null };
  const entradas = Object.entries(datos);
  let [horaMinima, infoMinima] = entradas[0];
  let precioMinimoMwh = infoMinima.price;

  for (const [hora, info] of entradas) {
    if (info.price < precioMinimoMwh) {
      precioMinimoMwh = info.price;
      horaMinima = hora;
    }
  }
  const precioMinimoKwh = (precioMinimoMwh / 1000).toFixed(3)
  return { precioMwh: precioMinimoMwh, precioKwh: precioMinimoKwh, hora: horaMinima };
}

// Función para calcular la media de los precios
function obtenerMediaPrecios(datos) {
  if (!datos) return { precioMwh: null, precioKwh: null };
  const preciosMwh = Object.values(datos).map(entry => entry.price);
  const sumaMwh = preciosMwh.reduce((total, precio) => total + precio, 0);
  const mediaMwh = (sumaMwh / preciosMwh.length).toFixed(3);
  const mediaKwh = (mediaMwh / 1000).toFixed(3);
  return {precioMwh: mediaMwh, precioKwh: mediaKwh };
}

// Función principal
async function main() {
  let datos = JSON.parse(localStorage.getItem("datosPrecioLuz"));
  const fechaActual = new Date().toISOString().split("T")[0];
  const fechaDatos = localStorage.getItem("fechaDatos");
  if (!datos || fechaDatos !== fechaActual) {
    datos = await obtenerDatosAPI();  
  }
  // Obtenemos el precio actual
  if(datos){
    const horaActual = new Date().getHours();
    const horaActualStr = horaActual.toString().padStart(2, '0') + '-' + (horaActual + 1).toString().padStart(2, '0');
    const precioActual = datos[horaActualStr]?.price;
    if (precioActual !== undefined) {
      console.log(`El precio actual para la franja horaria ${horaActualStr} es: ${precioActual}`);
      // Calculamos los costos y ponemos en HTML
      const costos = calcularCosto(electrodomesticos, precioActual);
      document.getElementById("precioLavadora").textContent = (`${costos.lavadora} €/h`)
      document.getElementById("precioOrdenador").textContent = (`${costos.ordenador} €/h`)
      document.getElementById("precioHorno").textContent = (`${costos.cocina} €/h`)
      document.getElementById("precioNevera").textContent = (`${costos.nevera} €/h`)
      document.getElementById("precioCalefaccion").textContent = (`${costos.calefaccion} €/h`) 
    }else {
      console.log(`No se encontró el precio para la franja horaria ${horaActualStr}`); 
    }
   // Calculamos y mostramos el precio máximo, mínimo y la media
  const { precioMwh: precioMaximoMwh, precioKwh: precioMaximoKwh, hora: horaMaxima } = obtenerPrecioMaximo(datos);
  const { precioMwh: precioMinimoMwh, precioKwh: precioMinimoKwh, hora: horaMinima } = obtenerPrecioMinimo(datos);
  const {precioMwh: mediaMwh, precioKwh: mediaKwh } = obtenerMediaPrecios(datos);
    
  //convertimos la cadena de texto en numeros con parseFloat para hacerlo accesible a los calculos del boton
  // let numeroMediaPrecios = parseFloat(mediaPrecios);

  document.getElementById("horaMenor").textContent = (`${horaMinima}h`)
  document.getElementById("precioMenor").textContent = (`${precioMinimoMwh} €/MWh (${precioMinimoKwh} €/kWk)`)

  document.getElementById("precioMedio").textContent = (`${mediaMwh} €/MWh (${mediaKwh} €/kWh)`)

  document.getElementById("horaMayor").textContent = (`${horaMaxima}h`)
  document.getElementById("precioMayor").textContent = (`${precioMaximoMwh} €/MWh (${precioMaximoKwh} €/kWh)`)
//Mostramos los precios por cada hora en la tabla
  const tabla = document.getElementById("tabla");
 
} else {
  //datos = obtenerDatosAPI();
 console.error('No se pudieron obtener os datos.');
}
}
main();

let electricItems = document.querySelectorAll("button");


const activePrompt = Array.from(electricItems).forEach((item) => {
  item.addEventListener("click", () => {
    let ventana = parseInt(prompt(`Ingresa el consumo de tu ${[item.id]} en W`));
    
    if(ventana < 0){
      alert('El número insertado debe ser positivo');
      }
    if (isNaN(ventana)) {
      alert(
        "Formato incorrecto. Por favor introduce solo la cantidad numérica"
      );
    } else {
           // Aquí modificamos el valor en el localStorage
      let electrodomesticos = JSON.parse(localStorage.getItem('electroStorage'));
      electrodomesticos[item.id] = ventana;
      localStorage.setItem('electroStorage', JSON.stringify(electrodomesticos));
      location.reload();
      }
      
      location.reload();
      
      
  });
});

