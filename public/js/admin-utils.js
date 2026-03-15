// admin-utils.js - Utilidades compartidas para el panel de administración

/**
 * Valida un formato de email básico
 * @param {string} email - El email a validar
 * @returns {boolean} - True si es válido
 */
function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

/**
 * Valida un número de teléfono (10 dígitos)
 * @param {string} phone - El teléfono a validar
 * @returns {boolean} - True si es válido
 */
function validatePhone(phone) {
    const re = /^\d{10}$/;
    return re.test(phone);
}

/**
 * Muestra una notificación temporal
 * @param {string} message - El mensaje a mostrar
 * @param {string} type - Tipo de notificación ('success', 'error', 'info')
 */
function showNotification(message, type = 'info') {
    // Remover notificaciones existentes
    const existingNotifications = document.querySelectorAll('.notification');
    existingNotifications.forEach(n => n.remove());

    // Crear nueva notificación
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 20px;
        background: ${type === 'success' ? '#4CAF50' : type === 'error' ? '#f44336' : '#2196F3'};
        color: white;
        border-radius: 5px;
        z-index: 1000;
        box-shadow: 0 2px 10px rgba(0,0,0,0.2);
    `;

    document.body.appendChild(notification);

    // Auto-remover después de 3 segundos
    setTimeout(() => {
        if (notification.parentNode) {
            notification.remove();
        }
    }, 3000);
}

/**
 * Muestra un modal de confirmación
 * @param {string} message - El mensaje de confirmación
 * @param {function} onConfirm - Función a ejecutar si confirma
 * @param {function} onCancel - Función a ejecutar si cancela (opcional)
 */
function showConfirmModal(message, onConfirm, onCancel = null) {
    // Crear modal
    const modal = document.createElement('div');
    modal.className = 'confirm-modal';
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0,0,0,0.5);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 1000;
    `;

    modal.innerHTML = `
        <div class="modal-content" style="
            background: white;
            padding: 20px;
            border-radius: 8px;
            max-width: 400px;
            width: 90%;
            box-shadow: 0 4px 20px rgba(0,0,0,0.3);
        ">
            <p style="margin: 0 0 20px 0; font-size: 16px;">${message}</p>
            <div style="display: flex; gap: 10px; justify-content: flex-end;">
                <button id="cancel-btn" style="
                    padding: 8px 16px;
                    border: 1px solid #ccc;
                    background: #f5f5f5;
                    border-radius: 4px;
                    cursor: pointer;
                ">Cancelar</button>
                <button id="confirm-btn" style="
                    padding: 8px 16px;
                    border: none;
                    background: #4CAF50;
                    color: white;
                    border-radius: 4px;
                    cursor: pointer;
                ">Confirmar</button>
            </div>
        </div>
    `;

    document.body.appendChild(modal);

    // Event listeners
    document.getElementById('confirm-btn').onclick = () => {
        onConfirm();
        modal.remove();
    };

    document.getElementById('cancel-btn').onclick = () => {
        if (onCancel) onCancel();
        modal.remove();
    };

    // Cerrar al hacer clic fuera
    modal.onclick = (e) => {
        if (e.target === modal) {
            if (onCancel) onCancel();
            modal.remove();
        }
    };
}

/**
 * Crea un modal de edición para productos
 * @param {object} product - Datos del producto
 * @param {function} onSave - Función a ejecutar al guardar
 */
function showEditProductModal(product, onSave) {
    const modal = document.createElement('div');
    modal.className = 'edit-modal';
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0,0,0,0.5);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 1000;
    `;

    modal.innerHTML = `
        <div class="modal-content" style="
            background: white;
            padding: 20px;
            border-radius: 8px;
            max-width: 500px;
            width: 90%;
            max-height: 80vh;
            overflow-y: auto;
            box-shadow: 0 4px 20px rgba(0,0,0,0.3);
        ">
            <h3 style="margin: 0 0 20px 0;">Editar Producto</h3>
            <form id="edit-product-form">
                <div style="margin-bottom: 15px;">
                    <label>Nombre:</label>
                    <input type="text" id="edit-nombre" value="${product.nombre || ''}" required style="width: 100%; padding: 8px; border: 1px solid #ccc; border-radius: 4px;">
                </div>
                <div style="margin-bottom: 15px;">
                    <label>Descripción:</label>
                    <textarea id="edit-descripcion" required style="width: 100%; padding: 8px; border: 1px solid #ccc; border-radius: 4px; min-height: 60px;">${product.descripcion || ''}</textarea>
                </div>
                <div style="margin-bottom: 15px;">
                    <label>Precio:</label>
                    <input type="number" id="edit-precio" value="${product.precio || ''}" step="0.01" required style="width: 100%; padding: 8px; border: 1px solid #ccc; border-radius: 4px;">
                </div>
                <div style="margin-bottom: 15px;">
                    <label>Stock:</label>
                    <input type="number" id="edit-stock" value="${product.stock || ''}" required style="width: 100%; padding: 8px; border: 1px solid #ccc; border-radius: 4px;">
                </div>
                <div style="margin-bottom: 15px;">
                    <label>Categoría:</label>
                    <input type="text" id="edit-categoria" value="${product.categoria || ''}" required style="width: 100%; padding: 8px; border: 1px solid #ccc; border-radius: 4px;">
                </div>
                <div style="margin-bottom: 15px;">
                    <label>Imagen URL:</label>
                    <input type="url" id="edit-imagen" value="${product.imagen || ''}" style="width: 100%; padding: 8px; border: 1px solid #ccc; border-radius: 4px;">
                </div>
                <div style="display: flex; gap: 10px; justify-content: flex-end; margin-top: 20px;">
                    <button type="button" id="cancel-edit-btn" style="
                        padding: 8px 16px;
                        border: 1px solid #ccc;
                        background: #f5f5f5;
                        border-radius: 4px;
                        cursor: pointer;
                    ">Cancelar</button>
                    <button type="submit" style="
                        padding: 8px 16px;
                        border: none;
                        background: #2196F3;
                        color: white;
                        border-radius: 4px;
                        cursor: pointer;
                    ">Guardar</button>
                </div>
            </form>
        </div>
    `;

    document.body.appendChild(modal);

    // Event listeners
    document.getElementById('cancel-edit-btn').onclick = () => modal.remove();

    document.getElementById('edit-product-form').onsubmit = (e) => {
        e.preventDefault();
        const updatedProduct = {
            id: product.id,
            nombre: document.getElementById('edit-nombre').value,
            descripcion: document.getElementById('edit-descripcion').value,
            precio: parseFloat(document.getElementById('edit-precio').value),
            stock: parseInt(document.getElementById('edit-stock').value),
            categoria: document.getElementById('edit-categoria').value,
            imagen: document.getElementById('edit-imagen').value
        };
        onSave(updatedProduct);
        modal.remove();
    };

    // Cerrar al hacer clic fuera
    modal.onclick = (e) => {
        if (e.target === modal) {
            modal.remove();
        }
    };
}

/**
 * Crea un modal de edición para clientes
 * @param {object} client - Datos del cliente
 * @param {function} onSave - Función a ejecutar al guardar
 */
function showEditClientModal(client, onSave) {
    const modal = document.createElement('div');
    modal.className = 'edit-modal';
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0,0,0,0.5);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 1000;
    `;

    modal.innerHTML = `
        <div class="modal-content" style="
            background: white;
            padding: 20px;
            border-radius: 8px;
            max-width: 500px;
            width: 90%;
            box-shadow: 0 4px 20px rgba(0,0,0,0.3);
        ">
            <h3 style="margin: 0 0 20px 0;">Editar Cliente</h3>
            <form id="edit-client-form">
                <div style="margin-bottom: 15px;">
                    <label>Nombre:</label>
                    <input type="text" id="edit-nombre" value="${client.nombre || ''}" required style="width: 100%; padding: 8px; border: 1px solid #ccc; border-radius: 4px;">
                </div>
                <div style="margin-bottom: 15px;">
                    <label>Email:</label>
                    <input type="email" id="edit-email" value="${client.email || ''}" required style="width: 100%; padding: 8px; border: 1px solid #ccc; border-radius: 4px;">
                </div>
                <div style="margin-bottom: 15px;">
                    <label>Teléfono:</label>
                    <input type="tel" id="edit-telefono" value="${client.telefono || ''}" required style="width: 100%; padding: 8px; border: 1px solid #ccc; border-radius: 4px;">
                </div>
                <div style="margin-bottom: 15px;">
                    <label>Dirección:</label>
                    <textarea id="edit-direccion" required style="width: 100%; padding: 8px; border: 1px solid #ccc; border-radius: 4px; min-height: 60px;">${client.direccion || ''}</textarea>
                </div>
                <div style="display: flex; gap: 10px; justify-content: flex-end; margin-top: 20px;">
                    <button type="button" id="cancel-edit-btn" style="
                        padding: 8px 16px;
                        border: 1px solid #ccc;
                        background: #f5f5f5;
                        border-radius: 4px;
                        cursor: pointer;
                    ">Cancelar</button>
                    <button type="submit" style="
                        padding: 8px 16px;
                        border: none;
                        background: #2196F3;
                        color: white;
                        border-radius: 4px;
                        cursor: pointer;
                    ">Guardar</button>
                </div>
            </form>
        </div>
    `;

    document.body.appendChild(modal);

    // Event listeners
    document.getElementById('cancel-edit-btn').onclick = () => modal.remove();

    document.getElementById('edit-client-form').onsubmit = (e) => {
        e.preventDefault();
        const email = document.getElementById('edit-email').value;
        const phone = document.getElementById('edit-telefono').value;

        // Validaciones
        if (!validateEmail(email)) {
            showNotification('Email inválido', 'error');
            return;
        }
        if (!validatePhone(phone)) {
            showNotification('Teléfono debe tener 10 dígitos', 'error');
            return;
        }

        const updatedClient = {
            id: client.id,
            nombre: document.getElementById('edit-nombre').value,
            email: email,
            telefono: phone,
            direccion: document.getElementById('edit-direccion').value
        };
        onSave(updatedClient);
        modal.remove();
    };

    // Cerrar al hacer clic fuera
    modal.onclick = (e) => {
        if (e.target === modal) {
            modal.remove();
        }
    };
}