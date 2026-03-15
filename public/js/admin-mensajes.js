document.addEventListener('DOMContentLoaded', () => {
    loadMensajesPlaceholder();
});

function loadMensajesPlaceholder() {
    const tbody = document.querySelector('table tbody');
    if (!tbody) return;

    tbody.innerHTML = `
        <tr>
            <td colspan="5" style="text-align: center; padding: 40px; color: #666;">
                No hay mensajes registrados aún. Implementa un endpoint y actualización en el frontend para cargar mensajes.
            </td>
        </tr>
    `;
}
