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
// Obtener datos almacenados en el LocalStorage y mostrar precios si existen
let precioPorHora = JSON.parse(localStorage.getItem('datosPrecioLuz'));
if (precioPorHora) {
  console.log('Datos obtenidos del LocalStorage:', precioPorHora);
  mostrarPreciosPorHora(precioPorHora);
} else {
  console.log('No hay datos en el LocalStorage');
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
    
  } else {
    const fechaActual = new Date().toISOString().split("T")[0];
    const fechaDatos = localStorage.getItem("fechaDatos");
   
    if (fechaDatos === fechaActual) {
      datos = JSON.parse(localStorage.getItem("datosPrecioLuz"));
     
    } else {
      datos = obtenerDatosAPI();
     
    }
  }
  
  // Obtenemos el precio actual
  const horaActual = new Date().getHours();
  const horaActualStr = horaActual.toString().padStart(2, '0') + '-' + (horaActual + 1).toString().padStart(2, '0');
  const precioActual = datos.data[horaActualStr].price;

  // Calculamos los costos y ponemos en HTML
  const costos = calcularCosto(electrodomesticos, precioActual);
  document.getElementById("precioLavadora").textContent = (`${costos.lavadora} €/h`)
  document.getElementById("precioOrdenador").textContent = (`${costos.ordenador} €/h`)
  document.getElementById("precioHorno").textContent = (`${costos.cocina} €/h`)
  document.getElementById("precioNevera").textContent = (`${costos.nevera} €/h`)
  document.getElementById("precioCalefaccion").textContent = (`${costos.calefaccion} €/h`)


  // Calculamos y mostramos el precio máximo, mínimo y la media
  const { precio: precioMaximo, hora: horaMaxima } = obtenerPrecioMaximo(datos);
  const { precio: precioMinimo, hora: horaMinima } = obtenerPrecioMinimo(datos);
  const mediaPrecios = obtenerMediaPrecios(datos);
  
  //convertimos la cadena de texto en numeros con parseFloat para hacerlo accesible a los calculos del boton
  let numeroMediaPrecios = parseFloat(mediaPrecios);

  document.getElementById("horaMenor").textContent = (`${horaMinima}h`)
  document.getElementById("precioMenor").textContent = (`${precioMinimo} €/MWh`)

  document.getElementById("precioMedio").textContent = (`${mediaPrecios} €/MWh`)

  document.getElementById("horaMayor").textContent = (`${horaMaxima}h`)
  document.getElementById("precioMayor").textContent = (`${precioMaximo} €/MWh`)

  let tabla = document.getElementsById("tabla");
  tabla.textContent = (`Hora: ${hora}, Precio: ${detalle.price}€`)
 
}

main();

let electricItems = document.querySelectorAll("button");


const activePrompt = Array.from(electricItems).forEach((item) => {
  item.addEventListener("click", () => {
    let ventana = parseInt(prompt(`Ingresa el consumo de tu ${[item.id]} en W`));
    
    if(ventana < 0){
      alert('El número ingresado debe de ser positivo')
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

