const API_URL = "http://127.0.0.1:8000";
let currentTab = 'registro';

document.addEventListener('DOMContentLoaded', function() {
    updateTimestamp();
    setInterval(updateTimestamp, 1000);
    initTabs();
    initEventListeners();
});

function updateTimestamp() {
    const now = new Date();
    const timeString = now.toLocaleTimeString('es-ES', { 
        hour: '2-digit', 
        minute: '2-digit', 
        second: '2-digit' 
    });
    const dateString = now.toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
    document.getElementById('current-time').textContent = `${dateString} ${timeString}`;
}

function initTabs() {
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');
    
    tabButtons.forEach(button => {
        button.addEventListener('click', function() {
            const tabId = this.dataset.tab;
            currentTab = tabId;
            
            document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            
            document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
            document.getElementById(tabId).classList.add('active');
        });
    });
}

function initEventListeners() {
    document.getElementById('btn-registrar').addEventListener('click', registrarUsuario);
    document.getElementById('btn-limpiar-registro').addEventListener('click', () => {
        limpiarFormulario('registro');
    });
    document.getElementById('btn-hash-password').addEventListener('click', hashPassword);
    
    document.getElementById('btn-cifrar-rsa').addEventListener('click', probarRSA);
    document.getElementById('btn-cifrar-aes').addEventListener('click', cifrarAES);
    document.getElementById('btn-limpiar-rsa').addEventListener('click', () => {
        limpiarFormulario('cifrado');
    });
    
    document.getElementById('btn-cifrar-clasico').addEventListener('click', probarVigenere);
    document.getElementById('btn-descifrar-clasico').addEventListener('click', descifrarVigenere);
    document.getElementById('btn-limpiar-clasico').addEventListener('click', () => {
        limpiarFormulario('clasico');
    });
    
    document.getElementById('btn-listar-usuarios').addEventListener('click', listarUsuarios);
    
    
    document.querySelectorAll('.clear-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const targetId = this.getAttribute('data-clear');
            document.getElementById(targetId).value = '';
            this.classList.remove('active');
        });
    });
    

    document.getElementById('togglePassword').addEventListener('click', function() {
        const passwordInput = document.getElementById('password');
        const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
        passwordInput.setAttribute('type', type);
        this.textContent = type === 'password' ? '👁️' : '🔒';
    });
    
    document.getElementById('password').addEventListener('input', function() {
        checkPasswordStrength(this.value);
    });
    
    document.querySelectorAll('.form-control').forEach(input => {
        input.addEventListener('input', function() {
            const clearBtn = this.parentElement.querySelector('.clear-btn');
            if (clearBtn) {
                if (this.value.trim() !== '') {
                    clearBtn.classList.add('active');
                } else {
                    clearBtn.classList.remove('active');
                }
            }
        });
    });
    
    document.querySelectorAll('input, textarea').forEach(input => {
        input.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                const tabId = currentTab;
                if (tabId === 'registro') {
                    document.getElementById('btn-registrar').click();
                } else if (tabId === 'cifrado') {
                    document.getElementById('btn-cifrar-rsa').click();
                } else if (tabId === 'clasico') {
                    document.getElementById('btn-cifrar-clasico').click();
                } else if (tabId === 'usuarios') {
                    document.getElementById('btn-buscar-usuario').click();
                }
            }
        });
    });
}

function checkPasswordStrength(password) {
    const strengthBar = document.getElementById('password-strength-bar');
    const hint = document.getElementById('password-hint');
    
    if (!password) {
        strengthBar.className = 'password-strength-bar';
        strengthBar.style.width = '0%';
        hint.textContent = '';
        return;
    }
    
    let strength = 0;
    let feedback = '';
    
    if (password.length >= 8) strength += 25;
    
    // números
    if (/\d/.test(password)) strength += 25;
    
    // mayúsculas y minúsculas
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength += 25;
    
    // caracteres especiales
    if (/[^A-Za-z0-9]/.test(password)) strength += 25;
    
    strengthBar.style.width = strength + '%';
    
    if (strength < 50) {
        strengthBar.style.backgroundColor = '#e74c3c';
        feedback = 'Contraseña débil. Use al menos 8 caracteres con números y letras.';
    } else if (strength < 75) {
        strengthBar.style.backgroundColor = '#f39c12';
        feedback = 'Contraseña aceptable. Considere añadir mayúsculas o símbolos.';
    } else if (strength < 90) {
        strengthBar.style.backgroundColor = '#2ecc71'; 
        feedback = 'Contraseña buena.';
    } else {
        strengthBar.style.backgroundColor = '#27ae60'; 
        feedback = 'Contraseña fuerte. Excelente seguridad.';
    }
    
    hint.textContent = feedback;
}

function showLoading() {
    document.getElementById('loading').classList.add('active');
    document.getElementById('output').style.display = 'none';
}

function hideLoading(outputText) {
    document.getElementById('loading').classList.remove('active');
    document.getElementById('output').style.display = 'block';
    document.getElementById('output').innerText = outputText;
}

function showStatus(containerId, message, type) {
    const container = document.getElementById(containerId);
    container.className = `status-message ${type}`;
    container.innerHTML = `
        <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
        <span>${message}</span>
    `;
    container.style.display = 'flex';
    
    if (type !== 'error') {
        setTimeout(() => {
            container.style.display = 'none';
        }, 5000);
    }
}

function showActionResult(type, title, content, containerId) {
    const container = document.getElementById(containerId);
    container.className = `action-result show`;
    container.innerHTML = `
        <h4 style="margin-bottom: 10px; color: ${type === 'success' ? 'var(--success)' : type === 'error' ? 'var(--danger)' : 'var(--primary)'}">
            <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
            ${title}
        </h4>
        <div>${content}</div>
    `;
}

//limpiar
function limpiarFormulario(tabId) {
    const inputs = document.querySelectorAll(`#${tabId} .form-control`);
    inputs.forEach(input => {
        input.value = '';
        const clearBtn = input.parentElement.querySelector('.clear-btn');
        if (clearBtn) clearBtn.classList.remove('active');
    });
    
    if (tabId === 'registro') {
        document.getElementById('password-strength-bar').className = 'password-strength-bar';
        document.getElementById('password-strength-bar').style.width = '0%';
        document.getElementById('password-hint').textContent = '';
    }
    
    //ocultar resultados
    const resultDiv = document.getElementById(`${tabId}-result`);
    if (resultDiv) resultDiv.classList.remove('show');
    
    showStatus(`${tabId}-status`, 'Formulario limpiado correctamente.', 'success');
}


//registrar
async function registrarUsuario() {
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value.trim();
    const nota = document.getElementById('nota').value.trim();
    
    if (!username || !password || !nota) {
        showStatus('registro-status', 'Por favor complete todos los campos', 'error');
        return;
    }
    showLoading();
    try {
        const response = await fetch(`${API_URL}/usuarios?username=${encodeURIComponent(username)}&nota_sensible=${encodeURIComponent(nota)}`, {
            method: 'POST'
        });
        const data = await response.json();
        hideLoading(JSON.stringify(data, null, 2));
        showStatus('registro-status', 'Usuario registrado exitosamente', 'success');
        document.getElementById('username').value = '';
        document.getElementById('password').value = '';
        document.getElementById('nota').value = '';
    } catch (error) {
        hideLoading(`Error: ${error.message}`);
        showStatus('registro-status', 'Error al registrar usuario', 'error');
        showActionResult('error', 'Error de Registro', 
            `No se pudo registrar el usuario.<br>
             <small>Error: ${error.message}</small>`, 
            'registro-result'
        );
    }
}

// Hash Bcrypt
async function hashPassword() {
    const password = document.getElementById('password').value.trim();
    
    if (!password) {
        showStatus('registro-status', 'Ingrese una contraseña para generar el hash', 'error');
    return;
}
showLoading();
try {
    const response = await fetch(`${API_URL}/hash-password?password=${encodeURIComponent(password)}`, {
        method: 'POST'
    });
       const data = await response.json();
       hideLoading(JSON.stringify(data, null, 2));
       showStatus('registro-status', 'Hash Bcrypt generado exitosamente', 'success');
       
   
   } catch (error) {
       hideLoading(`Error: ${error.message}`);
       showStatus('registro-status', 'Error al generar hash', 'error');
    }
}

//RSA
async function probarRSA() {
    const text = document.getElementById('raw_data').value.trim();
    
    if (!text) {
        showStatus('rsa-status', 'Ingrese texto para cifrar', 'error');
        return;
    }
    showLoading();
    try {
        const response = await fetch(`${API_URL}/encrypt/rsa?data=${encodeURIComponent(text)}`, { 
            method: 'POST' 
        });
        const data = await response.json();
        hideLoading(JSON.stringify(data, null, 2));
        showStatus('rsa-status', 'Cifrado RSA completado', 'success');
    
    } catch (error) {
        hideLoading(`Error: ${error.message}`);
        showStatus('rsa-status', 'Error en cifrado RSA', 'error');
        showActionResult('error', 'Error de Cifrado RSA',
            `No se pudo cifrar el texto.<br>
             <small>Error: ${error.message}</small>`,
            'rsa-result'
        );
    }
}

//AES
async function cifrarAES() {
    const text = document.getElementById('raw_data').value.trim();
    
    if (!text) {
        showStatus('rsa-status', 'Ingrese texto para cifrar', 'error');
        return;
    }
    showLoading();
    try {
        const response = await fetch(`${API_URL}/encrypt/aes?data=${encodeURIComponent(text)}`, { 
            method: 'POST' 
        });
        const data = await response.json();
        hideLoading(JSON.stringify(data, null, 2));
        showStatus('rsa-status', 'Cifrado AES completado', 'success');
    } catch (error) {
        hideLoading(`Error: ${error.message}`);
        showStatus('rsa-status', 'Error en cifrado AES', 'error');
        showActionResult('error', 'Error de Cifrado AES',
            `No se pudo cifrar el texto.<br>
             <small>Error: ${error.message}</small><br>
             <small>Nota: Este endpoint necesita ser implementado en el backend</small>`,
            'rsa-result'
        );
    }
}

//Vigenere
async function probarVigenere() {
    const text = document.getElementById('vigenere_text').value.trim();
    const key = document.getElementById('vigenere_key').value.trim();
    
    if (!text || !key) {
        showStatus('vigenere-status', 'Complete texto y clave', 'error');
        return;
    }
    showLoading();
    try {
        const response = await fetch(`${API_URL}/encrypt/vigenere?text=${encodeURIComponent(text)}&key=${encodeURIComponent(key)}`);
        const data = await response.json();
        hideLoading(JSON.stringify(data, null, 2));
        showStatus('vigenere-status', 'Cifrado completado', 'success');
    
    } catch (error) {
        hideLoading(`Error: ${error.message}`);
        showStatus('vigenere-status', 'Error en cifrado', 'error');
        showActionResult('error', 'Error de Cifrado',
            `No se pudo cifrar el texto.<br>
             <small>Error: ${error.message}</small>`,
            'clasico-result'
        );
    }
}

//descifrar Vigenere
async function descifrarVigenere() {
    const text = document.getElementById('vigenere_text').value.trim();
    const key = document.getElementById('vigenere_key').value.trim();
    
    if (!text || !key) {
        showStatus('vigenere-status', 'Complete texto y clave', 'error');
        return;
    }
    showLoading();
    try {
        const response = await fetch(`${API_URL}/decrypt/vigenere?text=${encodeURIComponent(text)}&key=${encodeURIComponent(key)}`);
        const data = await response.json();
        hideLoading(JSON.stringify(data, null, 2));
        showStatus('vigenere-status', 'Descifrado completado', 'success');
    } catch (error) {
        hideLoading(`Error: ${error.message}`);
        showStatus('vigenere-status', 'Error en descifrado', 'error');
        showActionResult('error', 'Error de Descifrado',
            `No se pudo descifrar el texto.<br>
             <small>Error: ${error.message}</small>`,
            'clasico-result'
        );
    }
}

//listar 
async function listarUsuarios() {
    showLoading();
    try {
        const response = await fetch(`${API_URL}/usuarios`);
        const data = await response.json();
        hideLoading(JSON.stringify(data, null, 2));
        showStatus('usuarios-status', 'Lista de usuarios cargada', 'success');
    
        const usuariosList = document.getElementById('usuarios-list');
        if (Array.isArray(data) && data.length > 0) {
            let html = '<div style="display: flex; flex-direction: column; gap: 12px;">';
            html += '<h4 style="color: var(--dark); margin-bottom: 10px;">Usuarios Registrados:</h4>';
            
            data.forEach(user => {
                html += `
                    <div style="background: white; border-radius: 8px; padding: 15px; border-left: 4px solid var(--primary); box-shadow: 0 2px 8px rgba(0,0,0,0.05);">
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                            <strong style="color: var(--dark);">
                               
                                ${user.username || 'N/A'}
                            </strong>
                        </div>
                        <div style="font-size: 0.85em; color: var(--gray);">
                            Nota cifrada: <span style="font-family: monospace; background: #f5f5f5; padding: 2px 6px; border-radius: 3px;">${user.nota ? user.nota.substring(0, 30) + '...' : 'N/A'}</span>
                        </div>
                    </div>
                `;
            });
            
            html += '</div>';
            usuariosList.innerHTML = html;
        } else {
            usuariosList.innerHTML = `
                <p class="empty-state" style="text-align: center; color: var(--gray); padding: 40px;">
                    <i class="fas fa-users" style="font-size: 3em; margin-bottom: 15px; display: block;"></i>
                    No hay usuarios registrados en el sistema.
                </p>
            `;
        }
    } catch (error) {
        hideLoading(`Error: ${error.message}`);
        showStatus('usuarios-status', 'Error al listar usuarios', 'error');
    }
}