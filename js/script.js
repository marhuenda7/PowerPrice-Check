// Definición de los electrodomésticos y su consumo en vatios
const electrodomesticos = {
  ordenador: 100,
  nevera: 150,
  calefactor: 1000,
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

// Función principal
async function main() {
  
  let datos = JSON.parse(localStorage.getItem("datosPrecioLuz"))
  if (!datos) {
    datos = obtenerDatosAPI();
    console.log('Sin datos');
  } else {
    const fechaActual = new Date().toISOString().split("T")[0];
    const fechaDatos = localStorage.getItem("fechaDatos");
    console.log(fechaActual, fechaDatos);
    if (fechaDatos === fechaActual) {
      datos = JSON.parse(localStorage.getItem("datosPrecioLuz"));
      console.log('Mismo dia');
    } else {
      datos = obtenerDatosAPI();
      console.log('Distinto dia');
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
}

main();
