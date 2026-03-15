document.addEventListener('DOMContentLoaded', () => {
    loadClientes();
    setupSearch();
    setupFilters();
});

async function loadClientes(filter = '') {
    try {
        const url = filter ? `/api/clientes?filter=${filter}` : '/api/clientes';
        const response = await fetch(url);
        const clientes = await response.json();
        renderClientes(clientes);
        updateStats(clientes);
    } catch (error) {
        console.error('Error loading clients:', error);
    }
}

function renderClientes(clientes) {
    const tbody = document.querySelector('#clientes-table tbody');
    tbody.innerHTML = '';

    clientes.forEach(cliente => {
        const ultimaCompra = cliente.UltimaCompra ? new Date(cliente.UltimaCompra).toLocaleDateString() : 'Nunca';
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>
                <div class="client-info">
                    <div class="client-avatar">${cliente.Nombre ? cliente.Nombre.charAt(0).toUpperCase() : 'C'}</div>
                    <span>${cliente.Nombre}</span>
                </div>
            </td>
            <td>${cliente.Correo}</td>
            <td>${cliente.Telefono || 'N/A'}</td>
            <td>${cliente.Pedidos}</td>
            <td>$${Number(cliente.TotalComprado).toFixed(2)}</td>
            <td>${ultimaCompra}</td>
            <td>
                <button class="btn-view" onclick="viewCliente(${cliente.Id_cliente})">Ver</button>
                <button class="btn-edit" onclick="editCliente(${cliente.Id_cliente})">Editar</button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

function updateStats(clientes) {
    const total = clientes.length;
    const frecuentes = clientes.filter(c => Number(c.Pedidos) > 5).length;
    const nuevos = clientes.filter(c => {
        if (!c.UltimaCompra) return false;
        const fecha = new Date(c.UltimaCompra);
        const haceUnMes = new Date();
        haceUnMes.setMonth(haceUnMes.getMonth() - 1);
        return fecha >= haceUnMes;
    }).length;

    const totalComprado = clientes.reduce((sum, c) => sum + Number(c.TotalComprado || 0), 0);
    const promedio = total > 0 ? totalComprado / total : 0;

    document.getElementById('stat-clientes-registrados').textContent = total;
    document.getElementById('stat-clientes-frecuentes').textContent = frecuentes;
    document.getElementById('stat-clientes-nuevos').textContent = nuevos;
    document.getElementById('stat-clientes-promedio').textContent = `$${promedio.toFixed(2)}`;
}

function setupSearch() {
    const searchInput = document.getElementById('search-cliente');
    searchInput.addEventListener('input', () => {
        const term = searchInput.value.toLowerCase();
        const rows = document.querySelectorAll('#clientes-table tbody tr');
        rows.forEach(row => {
            const nombre = row.cells[0].textContent.toLowerCase();
            const correo = row.cells[1].textContent.toLowerCase();
            row.style.display = nombre.includes(term) || correo.includes(term) ? '' : 'none';
        });
    });
}

function setupFilters() {
    const filterButtons = document.querySelectorAll('.filter-btn');
    filterButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            filterButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            const filter = btn.getAttribute('data-filter');
            loadClientes(filter === 'todos' ? '' : filter);
        });
    });
}

function viewCliente(id) {
    // Placeholder for view client details
    alert(`Ver detalles del cliente ${id}`);
}

function editCliente(id) {
    // Placeholder for edit client
    alert(`Editar cliente ${id}`);
}