document.addEventListener('DOMContentLoaded', () => {
    loadDashboardStats();
});

async function loadDashboardStats() {
    try {
        const [productosRes, pedidosRes] = await Promise.all([
            fetch('/api/productos'),
            fetch('/api/pedidos')
        ]);
        const productos = await productosRes.json();
        const pedidos = await pedidosRes.json();

        // Calculate stats
        const totalProductos = productos.length;
        const totalPedidos = pedidos.length;
        const pedidosRecientes = pedidos.filter(p => {
            const fecha = new Date(p.Fecha);
            const haceUnMes = new Date();
            haceUnMes.setMonth(haceUnMes.getMonth() - 1);
            return fecha >= haceUnMes;
        }).length;
        const ingresosTotales = pedidos.reduce((sum, p) => sum + Number(p.Total), 0);

        // Update cards
        document.getElementById('stat-total-productos').textContent = totalProductos;
        document.getElementById('stat-total-pedidos').textContent = totalPedidos;
        document.getElementById('stat-pedidos-recientes').textContent = pedidosRecientes;
        document.getElementById('stat-ingresos').textContent = `$${ingresosTotales.toFixed(2)}`;

        renderRecentOrders(pedidos);
        renderLowStockProducts(productos);

        document.getElementById('view-all-orders').addEventListener('click', () => {
            window.location.href = '/admin/admin-pedidos.html';
        });

        document.getElementById('manage-inventory').addEventListener('click', () => {
            window.location.href = '/admin/admin-inventario.html';
        });
    } catch (error) {
        console.error('Error loading dashboard stats:', error);
    }
}

function renderRecentOrders(pedidos) {
    const tbody = document.querySelector('#recent-orders-table tbody');
    tbody.innerHTML = '';

    const sorted = pedidos.sort((a, b) => new Date(b.Fecha) - new Date(a.Fecha));
    const recientes = sorted.slice(0, 5);

    recientes.forEach(pedido => {
        const fecha = new Date(pedido.Fecha).toLocaleDateString();
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${pedido.Id_pedido}</td>
            <td>${pedido.Cliente}</td>
            <td>$${Number(pedido.Total).toFixed(2)}</td>
            <td>${fecha}</td>
            <td><span class="status">${pedido.Estado}</span></td>
        `;
        tbody.appendChild(row);
    });
}

function renderLowStockProducts(productos) {
    const container = document.getElementById('low-stock-list');
    container.innerHTML = '';

    const lowStock = productos
        .filter(p => Number(p.Stock) < 5)
        .sort((a, b) => a.Stock - b.Stock)
        .slice(0, 5);

    if (lowStock.length === 0) {
        container.innerHTML = '<p style="color: #666;">No hay productos con poco stock.</p>';
        return;
    }

    lowStock.forEach(producto => {
        const item = document.createElement('div');
        item.className = 'stock-item';
        item.innerHTML = `
            <span>${producto.Nombre}</span>
            <span>${producto.Stock} disponibles</span>
        `;
        container.appendChild(item);
    });
}
