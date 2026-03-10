document.addEventListener('DOMContentLoaded', () => {
  const contenedor = document.getElementById('lista-productos');

  fetch('/api/productos')
    .then(res => {
      if (!res.ok) throw new Error('Error en la respuesta del servidor');
      return res.json();
    })
    .then(productos => {
      contenedor.innerHTML = '';

      if (productos.length === 0) {
        contenedor.innerHTML = '<p style="text-align:center; grid-column: 1 / -1;">No hay productos disponibles en este momento.</p>';
        return;
      }

      productos.forEach(p => {
        const div = document.createElement('div');
        div.className = 'tarjeta-producto';

        div.innerHTML = `
          <img src="${p.ImagenURL || 'https://via.placeholder.com/300x240?text=' + encodeURIComponent(p.Nombre)}" 
               alt="${p.Nombre}" 
               loading="lazy">
          <div class="info">
            <div class="tipo">${p.tipo}</div>
            <h3>${p.Nombre}</h3>
            <p class="precio">$${Number(p.Precio).toFixed(2)}</p>
            <p class="stock">Stock: ${p.Stock} unidades</p>
            <p class="descripcion">${p.Descripción.substring(0, 120)}${p.Descripción.length > 120 ? '...' : ''}</p>
            <button class="btn">Agregar al carrito</button>
          </div>
        `;

        contenedor.appendChild(div);
      });
    })
    .catch(err => {
      console.error(err);
      contenedor.innerHTML = '<p style="text-align:center; color:red; grid-column: 1 / -1;">Error al cargar los productos. Intenta recargar la página.</p>';
    });
});