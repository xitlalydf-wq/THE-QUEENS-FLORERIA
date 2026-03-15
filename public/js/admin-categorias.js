document.addEventListener('DOMContentLoaded', () => {
    loadCategorias();
});

async function loadCategorias() {
    try {
        const response = await fetch('/api/productos');
        const productos = await response.json();

        const categorias = productos.reduce((acc, producto) => {
            const cat = producto.Categoria || producto.tipo || 'Sin categoría';
            if (!acc[cat]) acc[cat] = 0;
            acc[cat] += 1;
            return acc;
        }, {});

        renderCategorias(categorias);
    } catch (error) {
        console.error('Error loading categories:', error);
    }
}

function renderCategorias(categorias) {
    const tbody = document.querySelector('table tbody');
    tbody.innerHTML = '';

    Object.entries(categorias).forEach(([categoria, count]) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${categoria}</td>
            <td>${count}</td>
            <td>Activa</td>
            <td>
                <div class="action-buttons">
                    <button class="btn-view" onclick="viewCategoria('${categoria}')">Ver</button>
                    <button class="btn-edit" onclick="editCategoria('${categoria}')">Editar</button>
                </div>
            </td>
        `;
        tbody.appendChild(row);
    });
}

function viewCategoria(categoria) {
    alert(`Ver categoría: ${categoria}`);
}

function editCategoria(categoria) {
    alert(`Editar categoría: ${categoria}`);
}
