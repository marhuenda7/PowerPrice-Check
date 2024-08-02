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

// Función para guardar los datos en el LocalStorage
function guardarDatosLocalStorage(datos) {
  const fecha = new Date().toISOString().split('T')[0]; // obtenemos la fecha actual
  localStorage.setItem('datosPrecioLuz', JSON.stringify(datos));
  localStorage.setItem('fechaDatos', fecha);
}

// Obtener datos almacenados en el LocalStorage y mostrar precios si existen
let precioPorHora = JSON.parse(localStorage.getItem("datosPrecioLuz"));
if (precioPorHora) {
  console.log("Datos obtenidos del LocalStorage:", precioPorHora);
  mostrarPreciosPorHora(precioPorHora);
} else {
  console.log("No hay datos en el LocalStorage");
}

function getIcon(datos, price) {
  const min = obtenerPrecioMinimo(datos).precioKwh * 1000;
  const max = obtenerPrecioMaximo(datos).precioKwh * 1000;
  const section = (max - min) / 3;
  const logoVerde = document.createElement('img');
  logoVerde.src = './img/green.png';
  logoVerde.alt = 'Bombilla verde';
  logoVerde.className = 'bombilla';
  const logoAmarillo = document.createElement('img');
  logoAmarillo.src = './img/yellow.png';
  logoAmarillo.alt = 'Bombilla amarilla';
  logoAmarillo.className = 'bombilla';
  const logoRojo = document.createElement('img');
  logoRojo.src = './img/red.png';
  logoRojo.alt = 'Bombilla roja';
  logoRojo.className = 'bombilla'

  
  if (price < min + section) {
    return logoVerde;
  } else if (price < min + section * 2) {
    return logoAmarillo;
  } else  {
    return logoRojo;
  }
}
// Función para obtener los precios y armar la tabla
function mostrarPreciosPorHora(datos) {
  const tabla = document
    .getElementById("tabla")
    .getElementsByTagName("tbody")[0];
  Object.entries(datos).forEach(([hora, detalle]) => {
    const fila = document.createElement("tr");
    const celdaHora = document.createElement("td");
    const celdaPrecioMwh = document.createElement("td");
    const celdaPrecioKwh = document.createElement("td");
    const celdaIcono = document.createElement("td");

    celdaHora.textContent = hora;
    celdaPrecioMwh.textContent = `${detalle.price} €/MWh`;
    celdaPrecioKwh.textContent = `${(detalle.price / 1000).toFixed(4)} €/kWh`;
    
    const icono = getIcon(datos, detalle.price);
    celdaIcono.appendChild(icono);
    fila.appendChild(celdaHora);
    fila.appendChild(celdaPrecioMwh);
    fila.appendChild(celdaPrecioKwh);
    fila.appendChild(celdaIcono);
    tabla.appendChild(fila);
  });
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

//Función para marcar en pantalla el consumo del usuario y
const marcarEnPantalla = document.getElementById("pantalla");
  marcarEnPantalla.addEventListener("keydown", (e) => {
    if (marcarEnPantalla.textContent.length >= 4) {
      e.preventDefault();
    }
  });
  const digits = document.querySelectorAll(".cDigit");
  for (const digit of digits) {
    digit.addEventListener("click", (e) => {
      if (marcarEnPantalla.textContent.length >= 4) {
        return false;
      }
      marcarEnPantalla.textContent =
        marcarEnPantalla.textContent + e.target.textContent;
    });
  }
  const btnC = document.getElementById("cB");
  btnC.addEventListener("click", function () {
    let datoIngresado = marcarEnPantalla.textContent;
    if (datoIngresado.length > 0) {
      marcarEnPantalla.textContent = datoIngresado.slice(0, -1);
    }
  });
  const btnReset = document.getElementById("clearB");
  btnReset.addEventListener("click", function () {
    marcarEnPantalla.textContent = "";
  });
  const btnIgual = document.getElementById("resultB");
  btnIgual.addEventListener("click", function () {
    const vatios = parseInt(marcarEnPantalla.textContent, 10);
    if (!isNaN(vatios)) {
      const horaActual = new Date().getHours();
      const horaActualStr =
        horaActual.toString().padStart(2, "0") +
        "-" +
        (horaActual + 1).toString().padStart(2, "0");
      const precioActual = datos[horaActualStr]?.price;
      const precioKwh = precioActual / 1000;
      const costo = ((vatios / 1000) * precioKwh).toFixed(2);
      marcarEnPantalla.textContent = `${costo} €/h`;
    } else {
      marcarEnPantalla.textContent = "Error";
    }
  });
}
main();

//Función para abrir y cerra la calculadora
const calculadora = document.getElementById("calculadora");
const btnAbrirCalculadora = document.querySelectorAll(".ejemplos");
const cerrarCalculadora = document.getElementById("cerrarB");
for (const buttonCalc of btnAbrirCalculadora) {
  buttonCalc.addEventListener("click", () => {
    calculadora.style.display = "block";
  });
}
cerrarCalculadora.addEventListener("click", () => {
  calculadora.style.display = "none";
});
window.addEventListener("click", (event) => {
  if (event.target === calculadora) {
    calculadora.style.display = "none";
  }
});