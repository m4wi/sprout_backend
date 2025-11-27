import { STATIC_PHOTO_API_URL } from '/config.js';

/**
 * Carga la imagen del usuario desde localStorage
 */
const loadUserAvatar = () => {
    try {
        const userStr = localStorage.getItem('user');
        if (userStr) {
            const user = JSON.parse(userStr);
            const avatarImg = document.getElementById('userAvatar');

            if (avatarImg && user.avatar_url) {
                // Construir la URL completa de la imagen
                avatarImg.src = `${STATIC_PHOTO_API_URL}${user.avatar_url}`;
                avatarImg.alt = `${user.name || 'Usuario'} ${user.lastname || ''}`;
            } else if (avatarImg) {
                // Imagen por defecto si no hay avatar
                avatarImg.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTAiIGhlaWdodD0iNTAiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTEyIDEyQzE0Ljc2MTQgMTIgMTcgOS43NjE0MiAxNyA3QzE3IDQuMjM4NTggMTQuNzYxNCAyIDEyIDJDOS4yMzg1OCAyIDcgNC4yMzg1OCA3IDdDNyA5Ljc2MTQyIDkuMjM4NTggMTIgMTIgMTJaIiBmaWxsPSIjNjVBRDJEIi8+CjxwYXRoIGQ9Ik0xMiAxNEMxNS44NjYgMTQgMTkgMTYuMTM0IDIwIDIwSDRDNC45OTk5OSAxNi4xMzQgOC4xMzM5OCAxNCAxMiAxNFoiIGZpbGw9IiM2NUFEMkQiLz4KPC9zdmc+';
            }
        }
    } catch (error) {
        console.error('Error al cargar avatar del usuario:', error);
    }
};

class MapSingleton {
    static instance;
    markers = [];

    constructor() {
        // Si ya existe una instancia, retornamos esa misma
        if (MapSingleton.instance) return MapSingleton.instance;

        // Creamos el mapa solo una vez
        this.map = L.map('map').setView([-18.0066, -70.2463], 13);

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(this.map);

        // Guardamos la instancia para futuras llamadas
        MapSingleton.instance = this;
    }

    getMap() {
        return this.map;
    }

    clearMarkers() {
        this.markers.forEach(marker => this.map.removeLayer(marker));
        this.markers = [];
    }

    addMarker(coords, markerOptions, popup) {
        const marker = L.marker(coords, markerOptions).addTo(this.map)
            .bindPopup(popup);
        this.markers.push(marker);
    }
}

// Inicializar mapa
let mapInstance = null;

// Función para obtener greenpoints por categoría
const fetchGreenPointsByCategory = async (categoryId) => {
    try {
        const response = await fetch(`http://localhost:3000/greenpoints/findCategory/${categoryId}`);
        if (!response.ok) {
            throw new Error('Error al obtener greenpoints');
        }
        const result = await response.json();
        renderGreenPoints(result.greenpoints);
    } catch (error) {
        console.error('Error:', error);
        const container = document.getElementById('resultsContainer');
        container.style.display = 'block';
        container.innerHTML = `<p class="error-msg">Error al cargar los puntos de reciclaje.</p>`;
    }
};

const filteredCategoryPopup = (greenpoint) => {
    console.log(greenpoint)
    //console.log(greenpoint)
    const foto = greenpoint.avatar_url
        ? `<img src="${greenpoint.avatar_url}" class="popup-img" />`
        : `<img src="https://via.placeholder.com/150" class="popup-img" />`;

    const categorias = (greenpoint.categories || [])
        .slice(0, 2) // máximo 2 categorías
        .map(cat => `<span class="popup-cat">${cat.name}</span>`)
        .join('');

    const creador = greenpoint.citizen_name || 'Desconocido';

    return `
        <div class="popup-container">
            ${foto}
            <h3>${greenpoint.description || 'Sin descripción'}</h3>
            <p><strong>Categorías:</strong> ${categorias}</p>
            <p><strong>Creado por:</strong> ${creador}</p>
            <a href="/pages/navigation/posts.html?id=${greenpoint.id_greenpoint}" class="btn btn-primary">Ver más</a>
        </div>
    `;
};


// Función para renderizar los resultados
const renderGreenPoints = (greenpoints) => {
    const container = document.getElementById('resultsContainer');
    container.innerHTML = ''; // Limpiar resultados anteriores
    container.style.display = 'block';

    // Limpiar marcadores del mapa
    if (mapInstance) {
        mapInstance.clearMarkers();
    }

    if (greenpoints.length === 0) {
        container.innerHTML = '<p>No se encontraron puntos de reciclaje para esta categoría.</p>';
        return;
    }

    const list = document.createElement('ul');
    list.className = 'greenpoints-list';

    greenpoints.forEach(gp => {
        // Crear elemento de lista
        const item = document.createElement('li');
        item.className = 'greenpoint-item';
        item.innerHTML = `
            <h3>${gp.description}</h3>
            <p>Categorías: ${gp.categories?.map(cat => cat.name).join(', ') || 'Sin categorías'}</p>
            <p>Horario: ${gp.hour || 'Sin descripción'}</p>
        `;
        list.appendChild(item);
        drawMarker(mapInstance, gp, filteredCategoryPopup(gp));
    });

    container.appendChild(list);
};



async function cargarGreenPoints(map) {
    try {
        const res = await fetch("http://localhost:3000/greenpoints"); // tu endpoint
        const data = await res.json();

        map.clearMarkers();

        data.forEach(gp => {
            drawMarker(mapInstance, gp, "dout");
        });

    } catch (err) {
        console.error("Error cargando GreenPoints:", err);
    }
}

async function drawMarker(mapInstance, gp, options) {

    const greenIcon = L.icon({
        iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.3/images/marker-shadow.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41]
    });

    const redIcon = L.icon({
        iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-grey.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.3/images/marker-shadow.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41]
    });


    const icon = gp.status === 'approved' || gp.status === 'pending' || gp.status === 'created'
        ? greenIcon
        : redIcon;

    mapInstance.addMarker([gp.coordinates.y, gp.coordinates.x], { icon }, options);
}



// Inicializar cuando el DOM esté listo
const init = () => {
    // Inicializar mapa
    mapInstance = new MapSingleton();
    const map = mapInstance.getMap();

    cargarGreenPoints(mapInstance);
    // Cargar avatar del usuario
    loadUserAvatar();

    // Manejo dinámico para categorías
    document.querySelectorAll('[data-category]').forEach(button => {
        button.addEventListener('click', (e) => {
            const category = e.target.dataset.category;
            const categoryId = e.target.dataset.id;
            console.log(`Filtrar por: ${category} (ID: ${categoryId})`);

            // Aplicar clase "active"
            document.querySelectorAll('[data-category]').forEach(btn => {
                btn.classList.remove('active');
            });
            e.target.classList.add('active');

            // Llamar al backend
            if (categoryId) {
                fetchGreenPointsByCategory(categoryId);
            }
        });
    });

    // Geolocalización
    const geolocationBtn = document.getElementById('btn-geolocalizacion');
    if (geolocationBtn) {
        geolocationBtn.addEventListener('click', () => {
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(
                    (position) => {
                        const { latitude, longitude } = position.coords;
                        console.log('Ubicación:', latitude, longitude);
                        // Centrar el mapa en la ubicación del usuario
                        if (map) {
                            map.setView([latitude, longitude], 15);
                            L.marker([latitude, longitude]).addTo(map)
                                .bindPopup('Tu ubicación').openPopup();
                        }
                    },
                    (error) => {
                        console.error('Error al obtener geolocalización:', error);
                        alert('No se pudo obtener tu ubicación');
                    }
                );
            } else {
                alert('Tu navegador no soporta geolocalización');
            }
        });
    }

    // --- Lógica para Modo Agregar GreenPoint ---
    const toggleBtn = document.getElementById('toggleModeBtn');
    const searchContent = document.getElementById('searchModeContent');
    const addContent = document.getElementById('addModeContent');
    const coordsInput = document.getElementById('gpCoords');
    let isAddMode = false;
    let tempMarker = null;

    if (toggleBtn) {
        toggleBtn.addEventListener('click', () => {
            isAddMode = !isAddMode;

            if (isAddMode) {
                // Activar modo agregar
                searchContent.style.display = 'none';
                addContent.style.display = 'block';
                toggleBtn.classList.add('cancel-mode');
                // Cambiar icono a X (usando path)
                toggleBtn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="currentColor" d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>';

                // Cambiar cursor del mapa
                document.getElementById('map').style.cursor = 'crosshair';

                // Evento click en mapa
                map.on('click', onMapClick);
            } else {
                // Volver a modo búsqueda
                searchContent.style.display = 'block';
                addContent.style.display = 'none';
                toggleBtn.classList.remove('cancel-mode');
                // Restaurar icono +
                toggleBtn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="currentColor" d="M11 13H5v-2h6V5h2v6h6v2h-6v6h-2z"/></svg>';

                // Restaurar cursor
                document.getElementById('map').style.cursor = '';

                // Remover evento y marcador temporal
                map.off('click', onMapClick);
                if (tempMarker) {
                    map.removeLayer(tempMarker);
                    tempMarker = null;
                }
                coordsInput.value = '';
            }
        });
    }

    function onMapClick(e) {
        const { lat, lng } = e.latlng;
        coordsInput.value = `${lat.toFixed(6)}, ${lng.toFixed(6)}`;

        if (tempMarker) {
            tempMarker.setLatLng(e.latlng);
        } else {
            tempMarker = L.marker(e.latlng, {
                icon: L.icon({
                    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-gold.png',
                    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.3/images/marker-shadow.png',
                    iconSize: [25, 41],
                    iconAnchor: [12, 41],
                    popupAnchor: [1, -34],
                    shadowSize: [41, 41]
                })
            }).addTo(map);
        }
    }

    // Manejo del formulario
    const addForm = document.getElementById('addGreenpointForm');
    if (addForm) {
        addForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            // Obtener usuario del localStorage
            const userStr = localStorage.getItem('user');
            if (!userStr) {
                alert('Debes iniciar sesión para registrar un GreenPoint.');
                return;
            }
            const user = JSON.parse(userStr);
            const id_citizen = user.id_user || user.id; // Ajustar según estructura del usuario

            // Obtener datos del formulario
            const description = document.getElementById('gpDescription').value;
            const coordsStr = coordsInput.value;

            // Obtener categorías seleccionadas
            const selectedCategories = Array.from(document.querySelectorAll('.checkbox-group input:checked'))
                .map(cb => parseInt(cb.value));

            if (selectedCategories.length === 0) {
                alert('Selecciona al menos una categoría.');
                return;
            }

            if (!coordsStr) {
                alert('Selecciona una ubicación en el mapa.');
                return;
            }

            // Parsear coordenadas
            const [lat, lng] = coordsStr.split(',').map(s => parseFloat(s.trim()));

            const payload = {
                id_category: selectedCategories[0], // Enviamos la primera como principal
                coordinates: {
                    latitude: lat,
                    longitude: lng
                },
                description: description,
                id_citizen: id_citizen,
                // qr_code y stars son opcionales
            };

            try {
                const submitBtn = addForm.querySelector('.submit-btn');
                submitBtn.disabled = true;
                submitBtn.textContent = 'Registrando...';

                const response = await fetch('http://localhost:3000/greenpoints', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(payload)
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.error || 'Error al registrar');
                }

                const newGp = await response.json();
                alert('GreenPoint registrado con éxito!');

                // Limpiar formulario y estado
                addForm.reset();
                coordsInput.value = '';
                if (tempMarker) {
                    map.removeLayer(tempMarker);
                    tempMarker = null;
                }

                // Volver al modo búsqueda y recargar mapa
                toggleBtn.click(); // Simula click para cerrar modo agregar
                cargarGreenPoints(mapInstance);

            } catch (error) {
                console.error('Error:', error);
                alert('Error: ' + error.message);
            } finally {
                const submitBtn = addForm.querySelector('.submit-btn');
                submitBtn.disabled = false;
                submitBtn.textContent = 'Registrar GreenPoint';
            }
        });
    }
};

// Ejecutar cuando el DOM esté listo
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}