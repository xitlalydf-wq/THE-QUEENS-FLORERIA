document.addEventListener('DOMContentLoaded', () => {
    loadPedidos();
});

async function loadPedidos() {
    try {
        const response = await fetch('/api/pedidos');
        const pedidos = await response.json();
        renderPedidos(pedidos);
    } catch (error) {
        console.error('Error loading orders:', error);
    }
}

function renderPedidos(pedidos) {
    const tbody = document.querySelector('#pedidos-table tbody');
    tbody.innerHTML = '';

    pedidos.forEach(pedido => {
        const fecha = new Date(pedido.Fecha).toLocaleDateString();
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${pedido.Id_pedido}</td>
            <td>${pedido.Cliente}</td>
            <td>${fecha}</td>
            <td>${pedido.Estado}</td>
            <td>$${Number(pedido.Total).toFixed(2)}</td>
            <td>
                <button class="btn-view" onclick="viewPedido(${pedido.Id_pedido})">Ver</button>
                <button class="btn-update" onclick="updateEstado(${pedido.Id_pedido})">Actualizar</button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

function viewPedido(id) {
    alert(`Ver detalles del pedido ${id}`);
}

function updateEstado(id) {
    const nuevoEstado = prompt('Nuevo estado (Pendiente, Enviado, Entregado):');
    if (nuevoEstado) {
        // Call API to update
        alert(`Actualizar pedido ${id} a ${nuevoEstado}`);
    }
}