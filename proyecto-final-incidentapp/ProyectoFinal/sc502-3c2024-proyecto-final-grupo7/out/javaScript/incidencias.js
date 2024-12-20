document.addEventListener('DOMContentLoaded', function () {

    let isEditing = false;
    let incidents = [];
    let priorities = [];
    let status = [];
    let usuarios = [];
    let watchers = [];
    let responders = [];
    let roles = [];
    let rolesUser = [];
    let timeLine = [];
    const API_URL = 'backend/incidencias.php';

    async function loadTimeLine(incidentId) {
        const timeLineContainer = document.getElementById('timeline-container');
        timeLineContainer.innerHTML = '<p class="text-center mt-3 fw-bold"> Click on an incident to see the timeline...</p>';

        try {
            const response = await fetch(`${API_URL}/timeline/${incidentId}`, {
                method: 'GET',
                credentials: 'include',
            });

            if (response.ok) {
                const data = await response.json();
                timeLine = data.timeline;
            } else {
                console.error('Error al cargar el timeline:', response.status);
                timeLineContainer.innerHTML = '<p>Error al cargar el historial.</p>';
            }
        } catch (error) {
            console.error('Error al cargar el timeline:', error);
            timeLineContainer.innerHTML = '<p>Error de conexión.</p>';
        }
    }

    async function loadPriorities() {
        try {
            const response = await fetch(API_URL, {
                method: 'GET',
                credentials: 'include'
            });
            if (response.ok) {
                const data = await response.json();
                insertPriorities(data.prioridades);
            } else {
                console.error('Error:', response.status);
            }
        } catch (error) {
            console.error('Error:', error);
        }
    }

    async function loadIncidents() {
        try {
            const response = await fetch(API_URL, {
                method: 'GET',
                credentials: 'include'
            });

            if (response.ok) {
                const data = await response.json();
                incidents = data.incidencias;
                priorities = data.prioridades;
                status = data.status;
                usuarios = data.usuarios;
                renderIncidents(incidents);
                console.log(data);
            } else {
                if (response.status === 401) {
                    window.location.href = 'index.html';
                }
                console.error('Error:', response.status);
            }
        } catch (error) {
            console.error('Error:', error);
        }
    }

    async function loadWatchersResponders() {
        try {
            const response = await fetch(API_URL, {
                method: 'GET',
                credentials: 'include'
            });
            if (response.ok) {
                const data = await response.json();
                watchers = data.watchers;
                responders = data.responder
            } else {
                console.error('Error:', response.status);
            }
        } catch (error) {
            console.error('Error:', error);
        }
    }

    async function loadRoles() {
        try {
            const response = await fetch(API_URL, {
                method: 'GET',
                credentials: 'include'
            });
            if (response.ok) {
                const data = await response.json();
                roles = data.roles;
            } else {
                console.error('Error:', response.status);
            }
        } catch (error) {
            console.error('Error:', error);
        }
    }

    async function loadRolUser() {
        try {
            const response = await fetch(API_URL, {
                method: 'GET',
                credentials: 'include'
            });
            if (response.ok) {
                const data = await response.json();
                rolesUser = data.rolesporusuario;
                console.log(rolesUser);
            } else {
                console.error('Error:', response.status);
            }
        } catch (error) {
            console.error('Error:', error);
        }
    }

    function renderTimeLine(timeLine) {
        const timeLineContainer = document.getElementById('timeline-container');

        if (timeLine.length === 0) {
            timeLineContainer.innerHTML = '<p class="text-center mt-3 fw-bold">There is no history...</p>';
            return;
        }

        timeLineContainer.innerHTML = timeLine.map(item => {
            const user = usuarios.find(usuario => usuario.id_usuario === item.id_usuario);
            const statusName = status.find(status => status.id_status === item.newStatus)?.nombre || 'Desconocido';
            const prevStatusName = status.find(status => status.id_status === item.prevStatus)?.nombre || 'Desconocido';
            const idIncidencia = item.id_incidencia;
            return `
                <div class="timeline-item border-bottom">
                    <div class="date">${new Date(item.fecha).toLocaleString()}</div>
                    <div class="status">De: <strong>${prevStatusName}</strong> → A: <strong>${statusName}</strong></div>
                    <div class="description"><strong>${item.descripcion || 'Sin descripción'}:</strong><strong class="text-info"> ${idIncidencia}</strong></div>
                    <div class="user">Realizado por: <strong>${user?.userName || 'Usuario desconocido'}</strong></div>
                    </div>
            `;
        }).join('');
    }

    function renderWatchersResponders(incidentId) {
        const infoList = document.getElementById('info-list');
        infoList.innerHTML = '';

        // Encuentra la incidencia
        const incident = incidents.find(incident => incident.id_incidencias === parseInt(incidentId));
        if (incident) {
            // Filtrar todos los watchers y responders correspondientes a la incidencia
            const watchersForIncident = watchers.filter(watcher => watcher.id_incidencia === incident.id_incidencias);
            const respondersForIncident = responders.filter(responder => responder.id_incidencia === incident.id_incidencias);

            const incidentCard = document.createElement('div');
            incidentCard.className = 'd-flex flex-column mb-2';
            incidentCard.innerHTML = `
                <div class="card mb-3 custom-card border border-info">
                    <div class="card-body row pb-0 ">
                        <div class="col">
                            <p class="card-title text-danger fw-bold">Incident ID: ${incident.id_incidencias}</p>
                        </div>
    
                        <div class="row">
                            <div class="col mb-3">
                                <h5 class="card-title text-uppercase font-weight-bold mb-3">Watchers</h5>
                                <div class="dropdown position-relative">
                                    <button class="btn btn-info btn-sm dropdown-toggle fw-bold" type="button" id="dropdownWatcherButton" data-bs-toggle="dropdown" aria-expanded="false">Add Watcher</button>

                                    <ul class="dropdown-menu dropdown-status position-absolute" style="z-index: 1050;" aria-labelledby="dropdownWatcherButton">
                                        ${usuarios.map(item => `
                                            <li class="dropdown-item-wrapper">
                                                <a class="dropdown-item usuario-watcher" href="#" data-id="${item.id_usuario}" incident-id="${incident.id_incidencias}">
                                                    ${item.userName}
                                                </a>
                                            </li>
                                        `).join('')}
                                    </ul>
                                </div>
                                    <ul class="list-group mt-2">
                                        ${watchersForIncident.map(watcher => {
                                        const user = usuarios.find(usuario => usuario.id_usuario === watcher.id_usuario);
                                        // Buscar el rol correspondiente en rolesporincidencia
                                        const watcherRole = rolesUser.find(role => role.id_usuario === watcher.id_usuario &&role.id_incidencia === incident.id_incidencias);
                                        const selectedRoleId = watcherRole ? watcherRole.id_rol : null;
                                        console.log(watcherRole, selectedRoleId);
                                        return `
                                            <li class="list-group-item">
                                            ${user ? user.userName : 'Desconocido'}
                                                <select class="form-select role-select" data-id="${watcher.id_usuario}" data-incident-id="${incident.id_incidencias}">
                                                ${roles.map(role => `
                                                    <option value="${role.id_rol}" ${role.id_rol === selectedRoleId ? 'selected' : ''}>
                                                     ${role.nombre}
                                                    </option>
                                                `).join('')}
                                                </select>
                                            </li>
                                        `;
                                        }).join('')}
                                    </ul>
                                </div>
    
                            <div class="col">
                                <h5 class="card-title text-uppercase font-weight-bold mb-3">Responders</h5>
                                <div class="dropdown position-relative">
                                    <button class="btn btn-info btn-sm dropdown-toggle fw-bold" type="button" id="dropdownResponderButton" data-bs-toggle="dropdown" aria-expanded="false">Add Responder</button>
                                    <ul class="dropdown-menu dropdown-status position-absolute" style="z-index: 1050;" aria-labelledby="dropdownResponderButton">
                                        ${usuarios.map(item => `
                                            <li class="dropdown-item-wrapper">
                                                <a class="dropdown-item usuario-responder" href="#" data-id="${item.id_usuario}" incident-id="${incident.id_incidencias}">
                                                    ${item.userName}
                                                </a>
                                            </li>
                                        `).join('')}
                                    </ul>
                                </div>
                                    <ul class="list-group mt-2">
                                    ${respondersForIncident.map(responder => {
                                    const user = usuarios.find(usuario => usuario.id_usuario === responder.id_usuario);
                                    // Buscar el rol correspondiente en rolesporincidencia
                                    const responderRole = rolesUser.find(role =>role.id_usuario === responder.id_usuario && role.id_incidencia === incident.id_incidencias);
                                    const selectedRoleId = responderRole ? responderRole.id_rol : null;
                                    console.log(responderRole, selectedRoleId, user);
                                    return `
                                        <li class="list-group-item">
                                            ${user ? user.userName : 'Desconocido'}
                                            <select class="form-select role-select" data-id="${responder.id_usuario}" data-incident-id="${incident.id_incidencias}">
                                                ${roles.map(role => `
                                                    <option value="${role.id_rol}" ${role.id_rol === selectedRoleId ? 'selected' : ''}>
                                                            ${role.nombre}
                                                    </option>
                                                `).join('')}
                                            </select>
                                        </li>
                                    `;
                                    }).join('')}
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            `;
            infoList.appendChild(incidentCard);
        }
        // Función para manejar el cambio de rol
            document.querySelectorAll('.role-select').forEach(select => {
            select.addEventListener('change', async (event) => {
                const newRoleId = parseInt(event.target.value); 
                const userId = parseInt(event.target.dataset.id);
                const incidentId = parseInt(event.target.dataset.incidentId);
                // Actualiza el rol en el array de watchers o responders según el id
                const targetArray = (event.target.closest('.col').querySelector('h5').innerText === 'Watchers') ? watchers : responders;
                const target = targetArray.find(item => item.id_usuario == userId && item.id_incidencia == incidentId);

                const existRole = rolesUser.find(role =>
                role.id_usuario === userId &&
                role.id_incidencia === incidentId 
                );

                if (existRole){
                    console.log('El rol ya existe');

                    const response = await fetch(API_URL, {
                        method: 'PUT',
                        headers:{
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            id_usuario: userId,
                            id_rol: newRoleId,
                            id_incidencia: incidentId
                        }),
                        credentials: 'include'
                    })
                    if(!response.ok){
                        console.error('Error:', response.status);
                    }else{
                        console.log('Rol actualizado');
                        loadWatchersResponders(incidentId);
                        renderWatchersResponders(incidentId);
                    }
                }else{
                    if (target) {
                        target.id_rol = newRoleId;
    
                        const response = await fetch(API_URL, {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json'
                            },
                            body: JSON.stringify({
                                id_usuario: userId,
                                id_rol: newRoleId,
                                id_incidencia: incidentId
                            }),
                            credentials: 'include'
                        })
                        if (!response.ok) {
                            console.error('Error:', response.status);
                        } else {
                            console.log('Nuevo rol asignado');
                            loadWatchersResponders(incidentId);
                            renderWatchersResponders(incidentId);
                        }
                    } else {
                        console.error('Usuario no encontrado');
                    }
                }
            });
        });
    }

    function renderIncidents(incidents) {
        const incidentList = document.getElementById('incident-list');
        incidentList.innerHTML = '';
        incidents.forEach(incident => {
            const priorityName = priorities.find(priority => priority.id_prioridad === incident.id_prioridad)?.nombre || 'Desconocido';
            const priorityColor = priorities.find(priority => priority.id_prioridad === incident.id_prioridad)?.color || 'Desconocido';
            const statusName = status.find(status => status.id_status === incident.id_status)?.nombre || 'Desconocido';
            const userName = usuarios.find(usuario => usuario.id_usuario === incident.id_usuario)?.userName || 'Desconocido';
            const incidentCard = document.createElement('div');
            incidentCard.className = 'd-flex flex-column mb-2';
            incidentCard.setAttribute('data-id', incident.id_incidencias);
            incidentCard.innerHTML = `
            <div class="card mb-3 custom-card">
                <div class="card-body row pb-0">

                    <div class="col">
                        <div class="row mb-2 mb-md-0 text-center text-md-start">
                            <!-- ID del incidente -->
                            <div class="col  text-start">
                                <span class="badge text-bg-secondary text-truncate">#${incident.id_incidencias}</span>
                            </div>

                            <!-- Prioridad -->
                            <div class="col-6  text-end">
                                <span class="fw-bold badge bg-${priorityColor}">${priorityName}</span>
                            </div>
                        </div>
                    </div>
                    
                    <div class="col-6"> 
                        <!-- Descripción -->
                        <div class="row">
                            <div >
                            <h5 class="card-title mb-0">${incident.nombre}</h5>
                            </div>

                            <div >
                            <p class="card-title mb-0 text-justify mt-2 fw-bold">${incident.descripcion}</p>
                            </div>
                        </div>
                    </div>

                    <div class="col">
                        <!-- Estado con Dropdown -->
                        <div class="dropdown position-relative">
                            <button class="btn btn-info btn-sm dropdown-toggle fw-bold" type="button" id="dropdownStatusButton" data-bs-toggle="dropdown" aria-expanded="false">
                                ${statusName}
                            </button>
                            <ul class="dropdown-menu dropdown-status position-absolute" style="z-index: 1050;" aria-labelledby="dropdownStatusButton">
                                <!-- Itera sobre el arreglo de status y crea las opciones -->
                                ${status.map(item => `
                                    <li>
                                        <a class="dropdown-item change-status" href="#" data-id="${incident.id_incidencias}" data-status="${item.id_status}">
                                            ${item.nombre}
                                        </a>
                                    </li>
                                `).join('')}
                            </ul>
                        </div>
                    </div>

                    <div class="col">
                        <div class="d-flex justify-content-between align-items-center mt-2">
                            <!-- Usuario -->
                            <p class="card-text mb-0 fw-bold">
                                ${userName}
                            </p>
                            <!-- Fecha de creación -->
                            <p class="card-text mb-0">
                                <small class="text-muted">Creation Date: ${incident.fecha_creacion}</small>
                            </p>
                        </div>
                    </div>

                </div>
            </div>
        `;
            incidentList.appendChild(incidentCard);
        });
    }

    // Función para filtrar por estado
    function renderFilter(statusId) {

        const incidentList = document.getElementById('incident-list');
        incidentList.innerHTML = '';
        const incidentsFiltered = incidents.filter(incident => incident.id_status === statusId);

        if (incidentsFiltered.length === 0) {
            incidentList.innerHTML = '<h3 class="text-center mt-3">No hay incidencias con este estado.</h3>';
            return;
        }

        incidentsFiltered.forEach(incident => {

            const priorityName = priorities.find(priority => priority.id_prioridad === incident.id_prioridad)?.nombre || 'Desconocido';
            const priorityColor = priorities.find(priority => priority.id_prioridad === incident.id_prioridad)?.color || 'Desconocido';
            const statusName = status.find(status => status.id_status === incident.id_status)?.nombre || 'Desconocido';
            const userName = usuarios.find(usuario => usuario.id_usuario === incident.id_usuario)?.userName || 'Desconocido';
            const incidentCard = document.createElement('div');
            incidentCard.className = 'd-flex flex-column mb-2';
            incidentCard.setAttribute('data-id', incident.id_incidencias);
            incidentCard.innerHTML = `
            <div class="card mb-3 custom-card">
                <div class="card-body row pb-0">
                    <div class="col">
                        <div class="row mb-2 mb-md-0 text-center text-md-start">
                            <!-- ID del incidente -->
                            <div class="col  text-start">
                                <span class="badge text-bg-secondary text-truncate">#${incident.id_incidencias}</span>
                            </div>

                            <!-- Prioridad -->  
                            <div class="col-6  text-end">
                                <span class="fw-bold badge bg-${priorityColor}">${priorityName}</span>
                            </div>
                        </div>
                    </div>

                    <div class="col-6"> 
                        <!-- Descripción -->
                        <div class="row">
                            <div >
                            <h5 class="card-title mb-0">${incident.nombre}</h5>
                            </div>

                            <div >
                            <p class="card-title mb-0 text-justify mt-2 fw-bold">${incident.descripcion}</p>
                            </div>
                        </div>
                    </div>

                    <div class="col">
                        <!-- Estado con Dropdown -->
                        <div class="dropdown position-relative">
                            <button class="btn btn-info btn-sm dropdown-toggle fw-bold" type="button" id="dropdownStatusButton" data-bs-toggle="dropdown" aria-expanded="false">
                                ${statusName}
                            </button>
                            <ul class="dropdown-menu dropdown-status position-absolute" style="z-index: 1050;" aria-labelledby="dropdownStatusButton">
                                <!-- Itera sobre el arreglo de status y crea las opciones -->
                                ${status.map(item => `
                                    <li>
                                        <a class="dropdown-item change-status" href="#" data-id="${incident.id_incidencias}" data-status="${item.id_status}">
                                            ${item.nombre}
                                        </a>
                                    </li>
                                `).join('')}
                            </ul>
                        </div>
                    </div>

                    <div class="col">
                        <div class="d-flex justify-content-between align-items-center mt-2">
                            <!-- Usuario -->
                            <p class="card-text mb-0 fw-bold">
                                ${userName}
                            </p>
                            <!-- Fecha de creación -->
                            <p class="card-text mb-0">
                                <small class="text-muted">Creation Date: ${incident.fecha_creacion}</small>
                            </p>
                        </div>
                    </div>

                </div>
            </div>
        `;
            incidentList.appendChild(incidentCard);
        });

    }

    // Función para filtrar por fecha
    function renderDateFilter(dateFilter) {

        const incidentList = document.getElementById('incident-list');
        incidentList.innerHTML = '';
        const incidentsFiltered = incidents.filter(incident => incident.fecha_creacion.split(' ')[0] === dateFilter);
        console.log(incidentsFiltered);

        if (incidentsFiltered.length === 0) {
            incidentList.innerHTML = '<h3 class="text-center mt-3">No hay incidencias con esta fecha.</h3>';
            return;
        }

        incidentsFiltered.forEach(incident => {

            const priorityName = priorities.find(priority => priority.id_prioridad === incident.id_prioridad)?.nombre || 'Desconocido';
            const priorityColor = priorities.find(priority => priority.id_prioridad === incident.id_prioridad)?.color || 'Desconocido';
            const statusName = status.find(status => status.id_status === incident.id_status)?.nombre || 'Desconocido';
            const userName = usuarios.find(usuario => usuario.id_usuario === incident.id_usuario)?.userName || 'Desconocido';
            const incidentCard = document.createElement('div');
            incidentCard.className = 'd-flex flex-column mb-2';
            incidentCard.setAttribute('data-id', incident.id_incidencias);
            incidentCard.innerHTML = `
            <div class="card mb-3 custom-card">
                <div class="card-body row pb-0">
                    <div class="col">
                        <div class="row mb-2 mb-md-0 text-center text-md-start">
                            <!-- ID del incidente -->
                            <div class="col  text-start">
                                <span class="badge text-bg-secondary text-truncate">#${incident.id_incidencias}</span>
                            </div>

                            <!-- Prioridad -->  
                            <div class="col-6  text-end">
                                <span class="fw-bold badge bg-${priorityColor}">${priorityName}</span>
                            </div>
                        </div>
                    </div>

                   <div class="col-6"> 
                        <!-- Descripción -->
                        <div class="row">
                            <div >
                            <h5 class="card-title mb-0">${incident.nombre}</h5>
                            </div>

                            <div >
                            <p class="card-title mb-0 text-justify mt-2 fw-bold">${incident.descripcion}</p>
                            </div>
                        </div>
                    </div>

                    <div class="col">
                        <!-- Estado con Dropdown -->
                        <div class="dropdown position-relative">
                            <button class="btn btn-info btn-sm dropdown-toggle fw-bold" type="button" id="dropdownStatusButton" data-bs-toggle="dropdown" aria-expanded="false">
                                ${statusName}
                            </button>
                            <ul class="dropdown-menu dropdown-status position-absolute" style="z-index: 1050;" aria-labelledby="dropdownStatusButton">
                                <!-- Itera sobre el arreglo de status y crea las opciones -->
                                ${status.map(item => `
                                    <li>
                                        <a class="dropdown-item change-status" href="#" data-id="${incident.id_incidencias}" data-status="${item.id_status}">
                                            ${item.nombre}
                                        </a>
                                    </li>
                                `).join('')}
                            </ul>
                        </div>
                    </div>

                    <div class="col">
                        <div class="d-flex justify-content-between align-items-center mt-2">
                            <!-- Usuario -->
                            <p class="card-text mb-0 fw-bold">
                                ${userName}
                            </p>
                            <!-- Fecha de creación -->
                            <p class="card-text mb-0">
                                <small class="text-muted">Creation Date: ${incident.fecha_creacion}</small>
                            </p>
                        </div>
                    </div>

                </div>
            </div>
        `;
            incidentList.appendChild(incidentCard);
        });
    }

    // Logica del dropdown en el formulario
    function insertPriorities(priorities) {
        const dropdownMenu = document.querySelector('.dropdown-menu');
        dropdownMenu.innerHTML = '';

        priorities.forEach(priority => {
            const dropdownItem = document.createElement('li');
            const dropdownLink = document.createElement('a');
            dropdownLink.classList.add('dropdown-item');
            dropdownLink.textContent = `P${priority.id_prioridad} ` + priority.nombre;
            dropdownLink.dataset.id = priority.id_prioridad;
            dropdownLink.addEventListener('click', (event) => {
                selectPriority(priority);
            });

            dropdownItem.appendChild(dropdownLink);
            dropdownMenu.appendChild(dropdownItem);
        });
    }
    // Trabaja con la logica del dropdown 
    function selectPriority(priority) {
        const priorityButton = document.getElementById('priorityDropdown');
        priorityButton.textContent = priority.nombre;
        priorityButton.dataset.priorityId = priority.id_prioridad;
    }

    document.getElementById('search-all').addEventListener('click', async function (event) {
        event.preventDefault();
        renderIncidents(incidents);
    });

    // Evgento que se dispara cuando se envia el formulario
    document.getElementById('incident-form').addEventListener('submit', async function (event) {
        event.preventDefault();

        const name = document.getElementById('name').value;
        const priorityId = parseInt(document.getElementById('priorityDropdown').dataset.priorityId);
        const description = document.getElementById('description').value;
        const status = 2;

        if (isEditing) {
            const response = await fetch(`${API_URL}?id=${edittingId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    nombre: name,
                    descripcion: description,
                    id_status: status,
                    id_prioridad: priorityId,
                }),
                credentials: 'include'
            });
            if (!response.ok) {
                console.error('Error trying to save a task');
            }
        } else {
            const newTask = {
                nombre: name,
                descripcion: description,
                id_status: status,
                id_prioridad: priorityId,
            };
            console.log(newTask);
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(newTask),
                credentials: 'include'
            });
            if (!response.ok) {
                console.error('Error trying to save a task');
            }
        }
        const modal = bootstrap.Modal.getInstance(document.getElementById('incidentModal'));
        modal.hide();
        loadIncidents();
    });

    //Evento del select para filtrar por fecha
    document.getElementById('search-date').addEventListener('change', async function (event) {

        event.preventDefault();
        const selectDate = event.target.value;
        console.log(selectDate);
        renderDateFilter(selectDate);

    })

    //Evento del select para filtrar por estado
    document.getElementById('status-search').addEventListener('change', async function (event) {
        event.preventDefault();
        console.log(event.target.value);
        const statusName = event.target.value;
        const statusId = status.find(status => status.nombre === statusName)?.id_status;

        renderFilter(statusId);
    })

    document.getElementById('incident-list').addEventListener('click', async function (event) {
        const incidentElement = event.target.closest('[data-id]');
        if (incidentElement) {
            const incidentId = incidentElement.getAttribute('data-id');
            loadWatchersResponders();
            loadTimeLine(incidentId);
            renderWatchersResponders(incidentId);
            renderTimeLine(timeLine);
        }
    });

    //Evento que se dispara cuando se selecciona un usuario para añadirlo como watcher o responder
    document.getElementById('info-list').addEventListener('click', async function (event) {
        if (event.target && event.target.matches('.usuario-watcher, .usuario-responder')) {
            const id = parseInt(event.target.dataset.id);
            const incidentId = parseInt(event.target.getAttribute('incident-id'));
            const action = event.target.matches('.usuario-watcher') ? 'watcher' : 'responder';
            console.log(id, incidentId);

            try {
                const response = await fetch(API_URL, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        id_incidencias: incidentId,
                        id_usuario: id,
                        action: action
                    }),
                    credentials: 'include'
                });
                if (!response.ok) {
                    console.error('Error:', response.status);
                }else{
                }
            } catch (error) {
                console.error('Error:', error);
            }
        }
    });

    //Evento que se dispara cuando para actualizar el estado de una incidencia
    document.getElementById('incident-list').addEventListener('click', async function (event) {
        if (event.target && event.target.matches('.change-status')) {
            const incidentId = event.target.dataset.id;
            const newStatus = event.target.dataset.status;

            try {
                const incident = incidents.find(incident => incident.id_incidencias === parseInt(incidentId));

                if (incident) {
                    const updatedIncident = { ...incident, id_status: parseInt(newStatus) };
                    console.log(incidentId);
                    const response = await fetch(`${API_URL}?id=${incidentId}`, {
                        method: 'PUT',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            id_incidencias: updatedIncident.id_incidencias,
                            nombre: updatedIncident.nombre,
                            descripcion: updatedIncident.descripcion,
                            id_status: updatedIncident.id_status,
                            id_prioridad: updatedIncident.id_prioridad
                        }),
                        credentials: 'include'
                    });

                    if (response.ok) {
                        loadIncidents();
                        loadTimeLine(incidentId);
                        renderTimeLine(timeLine);
                    } else {
                        console.error('Error:', response.status);
                    }
                } else {
                    console.error('Incidente no encontrado');
                }
            } catch (error) {
                console.error('Error:', error);
            }
        }
    });

    //Evento que se dispara cuando se abre el modal
    document.getElementById('incidentModal').addEventListener('show.bs.modal', function () {
        if (!isEditing) {
            document.getElementById('incident-form').reset();
        }
    });

    //Evento que se dispara cuando se cierra el modal
    document.getElementById("incidentModal").addEventListener('hidden.bs.modal', function () {
        editingId = null;
        isEditing = false;
    })
    loadPriorities();
    loadIncidents();
    loadWatchersResponders();
    loadRoles();
    loadRolUser();
    loadTimeLine();
});
