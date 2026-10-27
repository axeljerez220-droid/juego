import { supabase } from './supabaseClient.js';

// Referencias del DOM
const formJuego = document.getElementById('formulario-juego');
const gridJuegos = document.getElementById('grid-series');

// Cargar los juegos al iniciar la página
document.addEventListener('DOMContentLoaded', () => {
  cargarJuegos();
});

// ==============================================================
// FUNCIÓN PARA CONSULTAR Y RENDERIZAR LOS JUEGOS
// ==============================================================
async function cargarJuegos() {
  if (!gridJuegos) return;

  gridJuegos.innerHTML = '<p class="subtitle">Cargando juegos...</p>';

  // Consulta a la tabla 'juego'
  const { data: juegos, error } = await supabase
    .from('juego')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error("Error al cargar juegos:", error);
    gridJuegos.innerHTML = '<p class="subtitle">Error al cargar los juegos.</p>';
    return;
  }

  if (!juegos || juegos.length === 0) {
    gridJuegos.innerHTML = '<p class="subtitle">Aún no hay juegos registrados. ¡Sé el primero en agregar uno!</p>';
    return;
  }

  gridJuegos.innerHTML = '';

  // Renderizar tarjetas
  juegos.forEach(juego => {
    const card = document.createElement('article');
    card.className = 'card-serie';

    // Formatear el año para mostrar solo el número
    const anioMostrar = juego.año ? juego.año.split('-')[0] : 'N/A';

    card.innerHTML = `
      <img src="${juego.imagen || 'https://via.placeholder.com/300x400?text=Sin+Portada'}" alt="Portada de ${juego.nombre || 'Juego'}" onerror="this.src='https://via.placeholder.com/300x400?text=Sin+Portada'">
      <div class="card-body">
        <div class="card-header-info">
          <span class="badge-genero">${juego.genero || 'General'}</span>
          <span class="score">★ ${juego.puntuacion || 0}</span>
        </div>
        <h3 class="card-title">${juego.nombre || 'Sin título'}</h3>
        <p class="card-resena"><strong>Plataforma:</strong> ${juego.plataforma || 'N/A'} | <strong>Año:</strong> ${anioMostrar}</p>
        <p class="card-resena">${juego.descripcion || ''}</p>
        <div class="card-footer-author">
          Desarrollador: ${juego.desarrollador || 'Anónimo'}
        </div>
      </div>
    `;

    gridJuegos.appendChild(card);
  });
}

// ==============================================================
// FORMULARIO DE INSERCIÓN EN SUPABASE
// ==============================================================
if (formJuego) {
  formJuego.addEventListener('submit', async (e) => {
    e.preventDefault();

    const nombre = document.getElementById('nombre')?.value.trim() || null;
    const desarrollador = document.getElementById('desarrollador')?.value.trim() || null;
    const plataforma = document.getElementById('plataforma')?.value || null;
    const genero = document.getElementById('genero')?.value || null;

    // Formatear año para tipo 'date' en PostgreSQL (YYYY-01-01)
    const anioInput = document.getElementById('anio')?.value;
    const anioFormatted = anioInput ? `${anioInput}-01-01` : null;

    const puntuacion = parseFloat(document.getElementById('puntuacion')?.value) || null;
    
    // PRECIO: bigint espera un número entero
    const precioInput = document.getElementById('precio')?.value;
    const precio = precioInput ? parseInt(precioInput, 10) : null;

    const descripcion = document.getElementById('descripcion')?.value.trim() || null;
    const recomendacion = document.getElementById('recomendacion')?.value.trim() || null;
    const multijugador = document.getElementById('multijugador')?.checked || false;

    const archivoInput = document.getElementById('imagen');
    const archivo = archivoInput?.files[0];
    let imagenUrl = null;

    const btnSubmit = formJuego.querySelector('button[type="submit"]');
    if (btnSubmit) btnSubmit.disabled = true;

    try {
      // 1. Subida de imagen al Storage (si se seleccionó un archivo)
      if (archivo) {
        const nombreArchivo = `${Date.now()}_${archivo.name}`;

        const { data: storageData, error: storageError } = await supabase.storage
          .from('portadas')
          .upload(nombreArchivo, archivo);

        if (storageError) {
          alert("Error al subir la imagen: " + storageError.message);
          return;
        }

        const { data: urlData } = supabase.storage
          .from('portadas')
          .getPublicUrl(nombreArchivo);

        imagenUrl = urlData.publicUrl;
      }

      // 2. Construcción del objeto mapeando exactamente las columnas de SQL
      const nuevoJuego = {
        nombre: nombre,
        desarrollador: desarrollador,
        plataforma: plataforma,
        genero: genero,
        "año": anioFormatted, // Nombre exacto con carácter especial
        puntuacion: puntuacion,
        precio: precio,
        imagen: imagenUrl,
        descripcion: descripcion,
        recomendacion: recomendacion,
        multijugador: multijugador
      };

      // 3. Inserción en la tabla 'juego'
      const { data, error } = await supabase
        .from('juego')
        .insert([nuevoJuego]);

      if (error) {
        alert('Error al guardar en Supabase: ' + error.message);
      } else {
        alert('¡Juego registrado con éxito!');
        formJuego.reset();
        cargarJuegos(); // Recarga la lista automáticamente
      }
    } catch (err) {
      alert('Ocurrió un error inesperado: ' + err.message);
    } finally {
      if (btnSubmit) btnSubmit.disabled = false;
    }
  });
}