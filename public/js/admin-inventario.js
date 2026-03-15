document.addEventListener('DOMContentLoaded', () => {
    loadInventario();
});

async function loadInventario() {
    try {
        const response = await fetch('/api/productos');
        const productos = await response.json();
        const bajoStock = productos.filter(p => p.Stock < 5);
        renderInventario(bajoStock);
    } catch (error) {
        console.error('Error loading inventory:', error);
    }
}

function renderInventario(productos) {
    const tbody = document.querySelector('#inventario-table tbody');
    tbody.innerHTML = '';

    productos.forEach(producto => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td><img src="${producto.ImagenURL || '/images/placeholder.png'}" alt="${producto.Nombre}" class="product-img"></td>
            <td>${producto.Nombre}</td>
            <td>${producto.Stock}</td>
            <td>${producto.Categoria || 'Sin categoría'}</td>
            <td>
                <button class="btn-restock" onclick="restockProducto('${producto.tipo}', ${producto.id})">Reponer</button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

function restockProducto(tipo, id) {
    const cantidad = prompt('Cantidad a agregar:');
    if (cantidad && !isNaN(cantidad)) {
        // In a real app, call API to update stock
        alert(`Reponer ${cantidad} unidades de ${tipo} ${id}`);
    }
}