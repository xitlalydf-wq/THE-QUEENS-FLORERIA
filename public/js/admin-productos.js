const API_BASE = 'http://localhost:3000';

document.addEventListener('DOMContentLoaded', () => {
    loadProductos();
    setupForm();
    setupSearch();
    setupFilters();
});

async function loadProductos() {
    try {
        const response = await fetch(`${API_BASE}/api/productos`);
        const productos = await response.json();
        renderProductos(productos);
    } catch (error) {
        console.error('Error loading products:', error);
        showNotification('Error al cargar productos', 'error');
    }
}

function renderProductos(productos) {
    const tbody = document.querySelector('#productos-table tbody');
    tbody.innerHTML = '';

    productos.forEach(producto => {
        const estado = producto.Stock > 10 ? 'Activo' : producto.Stock > 0 ? 'Bajo stock' : 'Agotado';
        const estadoClass = estado === 'Activo' ? 'status-active' : estado === 'Bajo stock' ? 'status-low' : 'status-out';

        const row = document.createElement('tr');
        row.innerHTML = `
            <td><img src="${producto.ImagenURL || '/images/flor.png'}" alt="${producto.Nombre}" class="product-img"></td>
            <td>${producto.Nombre}</td>
            <td>${producto.Categoria || producto.tipo || 'Sin categoría'}</td>
            <td>$${Number(producto.Precio).toFixed(2)}</td>
            <td>${producto.Stock}</td>
            <td><span class="status ${estadoClass}">${estado}</span></td>
            <td>
                <button class="btn-edit" onclick="editProducto('${producto.tipo}', ${producto.id})">Editar</button>
                <button class="btn-delete" onclick="deleteProducto('${producto.tipo}', ${producto.id})">Eliminar</button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

function setupForm() {
    // Configurar categorías dinámicas
    const tipoSelect = document.getElementById('tipo-select');
    const categoriaSelect = document.getElementById('categoria-select');

    const categoriasPorTipo = {
         'Ramo': ['rosas_rojas', 'rosas_amarillas', 'tulipanes', 'lirios'],
         'Accesorio': ['peluches', 'globos_burbuja', 'coronas'],
         'Decorativo': ['graduaciones', 'arreglos', 'arreglo_de_carro']
    };

    tipoSelect.addEventListener('change', () => {
        const tipo = tipoSelect.value;
        categoriaSelect.innerHTML = '<option value="">Selecciona categoría</option>';

        if (categoriasPorTipo[tipo]) {
            categoriasPorTipo[tipo].forEach(cat => {
                const option = document.createElement('option');
                option.value = cat;
                option.textContent = cat.charAt(0).toUpperCase() + cat.slice(1);
                categoriaSelect.appendChild(option);
            });
        }
    });

    const form = document.getElementById('add-product-form');
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = new FormData(form);

        try {
            const response = await fetch(`${API_BASE}/api/productos`, {
                method: 'POST',
                body: formData // Enviar FormData para archivos
            });
            if (response.ok) {
                showNotification('Producto agregado correctamente', 'success');
                form.reset();
                loadProductos();
            } else {
                const error = await response.json();
                showNotification('Error al agregar producto: ' + (error.error || 'Error desconocido'), 'error');
            }
        } catch (error) {
            console.error('Error:', error);
            showNotification('Error al agregar producto', 'error');
        }
    });
}

async function editProducto(tipo, id) {
    try {
        // Fetch current product data
        const response = await fetch(`${API_BASE}/api/productos/${tipo}/${id}`);
        if (!response.ok) {
            showNotification('Error al cargar datos del producto', 'error');
            return;
        }
        const product = await response.json();

        // Show edit modal
        showEditProductModal(product, async (updatedProduct) => {
            try {
                const updateResponse = await fetch(`${API_BASE}/api/productos/${tipo}/${id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        nombre: updatedProduct.nombre,
                        categoria: updatedProduct.categoria,
                        precio: updatedProduct.precio,
                        stock: updatedProduct.stock,
                        descripcion: updatedProduct.descripcion,
                        imagenURL: updatedProduct.imagen
                    })
                });
                if (updateResponse.ok) {
                    showNotification('Producto actualizado correctamente', 'success');
                    loadProductos();
                } else {
                    showNotification('Error al actualizar producto', 'error');
                }
            } catch (error) {
                console.error('Error:', error);
                showNotification('Error al actualizar producto', 'error');
            }
        });
    } catch (error) {
        console.error('Error loading product:', error);
        showNotification('Error al cargar datos del producto', 'error');
    }
}

async function deleteProducto(tipo, id) {
    showConfirmModal('¿Está seguro de que desea eliminar este producto?', async () => {
        try {
            const response = await fetch(`${API_BASE}/api/productos/${tipo}/${id}`, {
                method: 'DELETE'
            });
            if (response.ok) {
                showNotification('Producto eliminado correctamente', 'success');
                loadProductos();
            } else {
                showNotification('Error al eliminar producto', 'error');
            }
        } catch (error) {
            console.error('Error:', error);
            showNotification('Error al eliminar producto', 'error');
        }
    });
}

function setupSearch() {
    const searchInput = document.getElementById('search-input');
    searchInput.addEventListener('input', filterProductos);
}

function setupFilters() {
    const filterSelect = document.getElementById('filter-categoria');
    filterSelect.addEventListener('change', filterProductos);
}

function filterProductos() {
    const searchTerm = document.getElementById('search-input').value.toLowerCase();
    const filterValue = document.getElementById('filter-categoria').value;
    const rows = document.querySelectorAll('#productos-table tbody tr');

    rows.forEach(row => {
        const nombre = row.cells[1].textContent.toLowerCase();
        const categoria = row.cells[2].textContent.toLowerCase();
        const matchesSearch = nombre.includes(searchTerm);
        const matchesFilter = filterValue === 'todos' || categoria === filterValue;
        row.style.display = matchesSearch && matchesFilter ? '' : 'none';
    });
}