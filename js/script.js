// Definición de los electrodomésticos y su consumo en vatios
const electrodomesticos = {
  ordenador: 100,
  nevera: 150,
  calefactor: 1000,
  // añade aquí más electrodomésticos si lo deseas
};

// Función para obtener los datos de la API
function obtenerDatosAPI() {
  fetch("https://bypass-cors-beta.vercel.app/?url=https://api.preciodelaluz.org/v1/prices/all?zone=PCB")
    .then(function (respuesta) {
      return respuesta.json();
    })
    .then(function (datos) {
      localStorage.setItem('datosPrecioLuz', JSON.stringify(datos));})
      .catch(function (err) {
        console.error(err.message);
      });
  }
obtenerDatosAPI()
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

// Función principal
async function main() {
  let datos;
  const fechaDatos = localStorage.getItem('fechaDatos');
  const fechaActual = new Date().toISOString().split('T')[0];
 
  // Comprobamos si ya hemos obtenido los datos hoy
  if (fechaDatos === fechaActual) {
    datos = JSON.stringify(localStorage.getItem('datosPrecioLuz'));
  } else {
    datos = await obtenerDatosAPI();
    guardarDatosLocalStorage(datos);
  }
  // Obtenemos el precio actual
  const horaActual = new Date().getHours();
  const precioActual = datos[horaActual].price;
  console.log(horaActual)
  console.log(precioActual)
  // Calculamos los costos
  const costos = calcularCosto(electrodomesticos, precioActual);

  // Mostramos los costos
  for (const [aparato, costo] of Object.entries(costos)) {
    console.log(`El costo de funcionamiento de un ${aparato} durante una hora es de ${costo}€.`);
  }
}

main();
