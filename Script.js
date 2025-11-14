// ==================== DADOS E CONFIGURAÇÕES ====================

let currentUser = null;
let cart = [];
let orders = [];
let orderCounter = 1000;
let currentProduct = null;
let checkoutData = {
    address: {},
    payment: null
};

// Mapeamento de imagens dos produtos
const productImages = {
    'Alface Hidropônica': 'product-alface.jpg',
    'Rúcula Hidropônica': 'product-rucula.jpg',
    'Salsinha Hidropônica': 'product-salsinha.jpg',
    'Cebolinha Hidropônica': 'product-cebolinha.jpg'
};

// ==================== INICIALIZAÇÃO ====================

function initializeData() {
    const savedUser = localStorage.getItem('vivaguasUser');
    const savedCart = localStorage.getItem('vivaguasCart');
    const savedOrders = localStorage.getItem('vivaguasOrders');
    const savedCounter = localStorage.getItem('vivaguasOrderCounter');
    
    if (savedUser) {
        currentUser = JSON.parse(savedUser);
        updateUserDisplay();
    }
    
    if (savedCart) {
        cart = JSON.parse(savedCart);
        updateCartCount();
    }
    
    if (savedOrders) {
        orders = JSON.parse(savedOrders);
    }
    
    if (savedCounter) {
        orderCounter = parseInt(savedCounter);
    }
}

function saveData() {
    if (currentUser) {
        localStorage.setItem('vivaguasUser', JSON.stringify(currentUser));
    } else {
        localStorage.removeItem('vivaguasUser');
    }
    localStorage.setItem('vivaguasCart', JSON.stringify(cart));
    localStorage.setItem('vivaguasOrders', JSON.stringify(orders));
    localStorage.setItem('vivaguasOrderCounter', orderCounter.toString());
}

// ==================== CONTROLE DE MODAIS ====================

function openModal(modalId) {
    const modal = document.getElementById(modalId);
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    modal.classList.remove('active');
    document.body.style.overflow = 'auto';
}

window.onclick = function(event) {
    if (event.target.classList.contains('modal')) {
        event.target.classList.remove('active');
        document.body.style.overflow = 'auto';
    }
}

// ==================== AUTENTICAÇÃO ====================

document.getElementById('userBtn').addEventListener('click', (e) => {
    e.preventDefault();
    if (currentUser) {
        openModal('profileModal');
        updateProfileDisplay();
    } else {
        openModal('loginModal');
    }
});

document.getElementById('loginForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.getElementById('loginEmail').value;
    
    currentUser = {
        name: email.split('@')[0].charAt(0).toUpperCase() + email.split('@')[0].slice(1),
        email: email,
        phone: '(11) 99999-9999'
    };
    
    saveData();
    updateUserDisplay();
    closeModal('loginModal');
    showNotification('Login realizado com sucesso!', 'success');
});

document.getElementById('registerForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('registerName').value;
    const email = document.getElementById('registerEmail').value;
    const phone = document.getElementById('registerPhone').value;
    
    currentUser = { name, email, phone };
    
    saveData();
    updateUserDisplay();
    closeModal('registerModal');
    showNotification('Cadastro realizado com sucesso!', 'success');
});

document.getElementById('showRegister').addEventListener('click', (e) => {
    e.preventDefault();
    closeModal('loginModal');
    openModal('registerModal');
});

document.getElementById('showLogin').addEventListener('click', (e) => {
    e.preventDefault();
    closeModal('registerModal');
    openModal('loginModal');
});

document.getElementById('logoutBtn').addEventListener('click', () => {
    currentUser = null;
    cart = [];
    saveData();
    updateUserDisplay();
    updateCartCount();
    closeModal('profileModal');
    showNotification('Você saiu da sua conta', 'info');
});

function updateUserDisplay() {
    const userNameDisplay = document.getElementById('userNameDisplay');
    if (currentUser) {
        userNameDisplay.textContent = currentUser.name.split(' ')[0];
    } else {
        userNameDisplay.textContent = 'Entrar';
    }
}

function updateProfileDisplay() {
    if (currentUser) {
        document.getElementById('profileName').textContent = currentUser.name;
        document.getElementById('profileEmail').textContent = currentUser.email;
        document.getElementById('profilePhone').textContent = currentUser.phone;
    }
}

// ==================== ADICIONAR AO CARRINHO ====================

document.querySelectorAll('.btn-cart').forEach(button => {
    button.addEventListener('click', (e) => {
        if (!currentUser) {
            showNotification('Faça login para adicionar produtos ao carrinho', 'warning');
            openModal('loginModal');
            return;
        }
        
        const productCard = e.target.closest('.product-card');
        const productName = productCard.querySelector('h3').textContent;
        const productPriceText = productCard.querySelector('.price').textContent;
        const productPrice = parseFloat(productPriceText.replace('R$', '').replace('-', '').trim().split(' ')[0].replace(',', '.'));
        
        currentProduct = {
            name: productName,
            price: productPrice,
            image: productImages[productName]
        };
        
        openAddToCartModal();
    });
});

function openAddToCartModal() {
    const modalImage = document.getElementById('modalProductImage');
    
    // Se o produto tem imagem, mostrar ela
    if (currentProduct.image) {
        modalImage.innerHTML = `<img src="${currentProduct.image}" alt="${currentProduct.name}" style="width: 100%; height: 100%; object-fit: cover; border-radius: 15px;">`;
    } else {
        modalImage.innerHTML = '<i class="fas fa-leaf"></i>';
    }
    
    document.getElementById('modalProductName').textContent = currentProduct.name;
    document.getElementById('modalProductPrice').textContent = `R$ ${currentProduct.price.toFixed(2).replace('.', ',')}`;
    document.getElementById('quantityInput').value = 1;
    updateModalTotal();
    openModal('addToCartModal');
}

document.getElementById('increaseQty').addEventListener('click', () => {
    const input = document.getElementById('quantityInput');
    input.value = parseInt(input.value) + 1;
    updateModalTotal();
});

document.getElementById('decreaseQty').addEventListener('click', () => {
    const input = document.getElementById('quantityInput');
    if (parseInt(input.value) > 1) {
        input.value = parseInt(input.value) - 1;
        updateModalTotal();
    }
});

document.getElementById('quantityInput').addEventListener('input', () => {
    updateModalTotal();
});

function updateModalTotal() {
    const quantity = parseInt(document.getElementById('quantityInput').value) || 1;
    const total = currentProduct.price * quantity;
    document.getElementById('modalTotal').textContent = `R$ ${total.toFixed(2).replace('.', ',')}`;
}

document.getElementById('confirmAddCart').addEventListener('click', () => {
    const quantity = parseInt(document.getElementById('quantityInput').value) || 1;
    
    const existingItem = cart.find(item => item.name === currentProduct.name);
    
    if (existingItem) {
        existingItem.quantity += quantity;
    } else {
        cart.push({
            name: currentProduct.name,
            price: currentProduct.price,
            quantity: quantity,
            image: currentProduct.image
        });
    }
    
    saveData();
    updateCartCount();
    closeModal('addToCartModal');
    showNotification(`${quantity}x ${currentProduct.name} adicionado ao carrinho!`, 'success');
});

// ==================== CARRINHO ====================

document.getElementById('cartBtn').addEventListener('click', (e) => {
    e.preventDefault();
    openModal('cartModal');
    updateCartDisplay();
});

function updateCartCount() {
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    document.getElementById('cartCount').textContent = totalItems;
}

function updateCartDisplay() {
    const cartItems = document.getElementById('cartItems');
    const cartFooter = document.getElementById('cartFooter');
    const cartTotal = document.getElementById('cartTotal');
    
    if (cart.length === 0) {
        cartItems.innerHTML = '<p class="empty-cart">Seu carrinho está vazio</p>';
        cartFooter.style.display = 'none';
        return;
    }
    
    cartItems.innerHTML = '';
    let total = 0;
    
    cart.forEach((item, index) => {
        const itemTotal = item.price * item.quantity;
        total += itemTotal;
        
        const cartItemElement = document.createElement('div');
        cartItemElement.className = 'cart-item';
        cartItemElement.innerHTML = `
            <div class="cart-item-image">
                ${item.image ? `<img src="${item.image}" alt="${item.name}">` : '<i class="fas fa-leaf"></i>'}
            </div>
            <div class="cart-item-info">
                <h4>${item.name}</h4>
                <p>R$ ${item.price.toFixed(2).replace('.', ',')} cada</p>
            </div>
            <div class="cart-item-controls">
                <button class="qty-btn" onclick="decreaseQuantity(${index})">-</button>
                <span class="qty-display">${item.quantity}</span>
                <button class="qty-btn" onclick="increaseQuantity(${index})">+</button>
            </div>
            <div class="cart-item-price">
                R$ ${itemTotal.toFixed(2).replace('.', ',')}
            </div>
            <button class="cart-item-remove" onclick="removeFromCart(${index})">
                <i class="fas fa-trash"></i>
            </button>
        `;
        cartItems.appendChild(cartItemElement);
    });
    
    cartTotal.textContent = `R$ ${total.toFixed(2).replace('.', ',')}`;
    cartFooter.style.display = 'block';
}

window.increaseQuantity = function(index) {
    cart[index].quantity++;
    saveData();
    updateCartCount();
    updateCartDisplay();
}

window.decreaseQuantity = function(index) {
    if (cart[index].quantity > 1) {
        cart[index].quantity--;
        saveData();
        updateCartCount();
        updateCartDisplay();
    } else {
        removeFromCart(index);
    }
}

window.removeFromCart = function(index) {
    cart.splice(index, 1);
    saveData();
    updateCartCount();
    updateCartDisplay();
    showNotification('Produto removido do carrinho', 'info');
}

// ==================== CHECKOUT ====================

document.getElementById('checkoutBtn').addEventListener('click', () => {
    if (cart.length === 0) {
        showNotification('Seu carrinho está vazio', 'warning');
        return;
    }
    
    closeModal('cartModal');
    openModal('checkoutModal');
    goToStep(1);
});

function goToStep(stepNumber) {
    // Atualizar indicadores
    document.querySelectorAll('.step').forEach((step, index) => {
        step.classList.remove('active', 'completed');
        if (index + 1 < stepNumber) {
            step.classList.add('completed');
        } else if (index + 1 === stepNumber) {
            step.classList.add('active');
        }
    });
    
    // Mostrar conteúdo correto
    document.querySelectorAll('.checkout-step-content').forEach(content => {
        content.style.display = 'none';
    });
    document.getElementById(`step${stepNumber}`).style.display = 'block';
}

// Step 1: Endereço
document.getElementById('nextToPayment').addEventListener('click', () => {
    const form = document.getElementById('addressForm');
    
    if (!form.checkValidity()) {
        form.reportValidity();
        return;
    }
    
    checkoutData.address = {
        cep: document.getElementById('cep').value,
        rua: document.getElementById('rua').value,
        numero: document.getElementById('numero').value,
        complemento: document.getElementById('complemento').value,
        bairro: document.getElementById('bairro').value,
        cidade: document.getElementById('cidade').value,
        estado: document.getElementById('estado').value
    };
    
    goToStep(2);
});

// Step 2: Pagamento
document.querySelectorAll('.payment-option').forEach(option => {
    option.addEventListener('click', () => {
        document.querySelectorAll('.payment-option').forEach(opt => {
            opt.classList.remove('selected');
        });
        option.classList.add('selected');
        checkoutData.payment = option.dataset.method;
    });
});

document.getElementById('backToAddress').addEventListener('click', () => {
    goToStep(1);
});

document.getElementById('nextToConfirmation').addEventListener('click', () => {
    if (!checkoutData.payment) {
        showNotification('Selecione uma forma de pagamento', 'warning');
        return;
    }
    
    goToStep(3);
    updateConfirmation();
});

// Step 3: Confirmação
document.getElementById('backToPayment').addEventListener('click', () => {
    goToStep(2);
});

function updateConfirmation() {
    // Endereço
    const address = checkoutData.address;
    document.getElementById('confirmAddress').innerHTML = `
        ${address.rua}, ${address.numero}${address.complemento ? ' - ' + address.complemento : ''}<br>
        ${address.bairro} - ${address.cidade}/${address.estado}<br>
        CEP: ${address.cep}
    `;
    
    // Pagamento
    const paymentNames = {
        'pix': 'Pix',
        'cartao': 'Cartão de Crédito',
        'boleto': 'Boleto Bancário',
        'dinheiro': 'Dinheiro na Entrega'
    };
    document.getElementById('confirmPayment').textContent = paymentNames[checkoutData.payment];
    
    // Itens
    const confirmItems = document.getElementById('confirmItems');
    confirmItems.innerHTML = '';
    
    cart.forEach(item => {
        const confirmItem = document.createElement('div');
        confirmItem.className = 'confirmation-item';
        confirmItem.innerHTML = `
            <div class="confirmation-item-image">
                ${item.image ? `<img src="${item.image}" alt="${item.name}" style="width:100%;height:100%;object-fit:cover;border-radius:8px;">` : '<i class="fas fa-leaf"></i>'}
            </div>
            <div class="confirmation-item-info">
                <h5>${item.name}</h5>
                <p>Quantidade: ${item.quantity}</p>
            </div>
            <div class="confirmation-item-price">
                R$ ${(item.price * item.quantity).toFixed(2).replace('.', ',')}
            </div>
        `;
        confirmItems.appendChild(confirmItem);
    });
    
    // Totais
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const delivery = 5.00;
    const total = subtotal + delivery;
    
    document.getElementById('confirmSubtotal').textContent = `R$ ${subtotal.toFixed(2).replace('.', ',')}`;
    document.getElementById('confirmDelivery').textContent = `R$ ${delivery.toFixed(2).replace('.', ',')}`;
    document.getElementById('confirmTotal').textContent = `R$ ${total.toFixed(2).replace('.', ',')}`;
}

document.getElementById('confirmOrder').addEventListener('click', () => {
    const orderNumber = orderCounter++;
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const delivery = 5.00;
    const total = subtotal + delivery;
    
    const newOrder = {
        orderNumber: orderNumber,
        date: new Date().toLocaleString('pt-BR'),
        items: [...cart],
        subtotal: subtotal,
        delivery: delivery,
        total: total,
        status: 'confirmed',
        customer: currentUser.name,
        address: {...checkoutData.address},
        payment: checkoutData.payment
    };
    
    orders.unshift(newOrder);
    cart = [];
    
    saveData();
    updateCartCount();
    
    closeModal('checkoutModal');
    document.getElementById('orderNumber').textContent = orderNumber;
    openModal('successModal');
    
    // Reset checkout
    checkoutData = { address: {}, payment: null };
    document.getElementById('addressForm').reset();
    document.querySelectorAll('.payment-option').forEach(opt => {
        opt.classList.remove('selected');
    });
});

// ==================== PEDIDOS ====================

document.getElementById('myOrdersBtn').addEventListener('click', () => {
    closeModal('profileModal');
    openModal('ordersModal');
    updateOrdersDisplay();
});

document.getElementById('viewOrderBtn').addEventListener('click', () => {
    closeModal('successModal');
    openModal('ordersModal');
    updateOrdersDisplay();
});

function updateOrdersDisplay() {
    const ordersList = document.getElementById('ordersList');
    
    if (orders.length === 0) {
        ordersList.innerHTML = '<p class="no-orders">Você ainda não fez nenhum pedido</p>';
        return;
    }
    
    ordersList.innerHTML = '';
    
    orders.forEach(order => {
        const orderCard = document.createElement('div');
        orderCard.className = 'order-card';
        
        let itemsHtml = '';
        order.items.forEach(item => {
            itemsHtml += `
                <div class="order-item">
                    <span>${item.quantity}x ${item.name}</span>
                    <span>R$ ${(item.price * item.quantity).toFixed(2).replace('.', ',')}</span>
                </div>
            `;
        });
        
        const paymentNames = {
            'pix': 'Pix',
            'cartao': 'Cartão de Crédito',
            'boleto': 'Boleto Bancário',
            'dinheiro': 'Dinheiro na Entrega'
        };
        
        orderCard.innerHTML = `
            <div class="order-header">
                <div>
                    <div class="order-number">Pedido #${order.orderNumber}</div>
                    <div class="order-date">${order.date}</div>
                </div>
                <span class="order-status ${order.status}">
                    ${order.status === 'confirmed' ? 'Confirmado' : 'Pendente'}
                </span>
            </div>
            <div class="order-items">
                ${itemsHtml}
                <div class="order-item" style="margin-top: 1rem; padding-top: 1rem; border-top: 1px solid #e9ecef;">
                    <span><i class="fas fa-truck"></i> Entrega</span>
                    <span>R$ ${order.delivery.toFixed(2).replace('.', ',')}</span>
                </div>
            </div>
            <div class="order-info" style="margin-top: 1rem; padding: 1rem; background: white; border-radius: 8px; font-size: 0.9rem;">
                <p style="margin-bottom: 0.5rem;"><i class="fas fa-credit-card"></i> <strong>Pagamento:</strong> ${paymentNames[order.payment]}</p>
                <p style="margin-bottom: 0;"><i class="fas fa-map-marker-alt"></i> <strong>Endereço:</strong> ${order.address.rua}, ${order.address.numero} - ${order.address.cidade}/${order.address.estado}</p>
            </div>
            <div class="order-total">
                <span>Total:</span>
                <span>R$ ${order.total.toFixed(2).replace('.', ',')}</span>
            </div>
        `;
        
        ordersList.appendChild(orderCard);
    });
}

// ==================== NOTIFICAÇÕES ====================

function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'warning' ? 'exclamation-triangle' : 'info-circle'}"></i>
        <span>${message}</span>
    `;
    
    notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        background: ${type === 'success' ? '#28a745' : type === 'warning' ? '#ffc107' : '#17a2b8'};
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 10px;
        box-shadow: 0 5px 20px rgba(0,0,0,0.3);
        z-index: 3000;
        display: flex;
        align-items: center;
        gap: 0.8rem;
        animation: slideInRight 0.3s ease;
        font-weight: 500;
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from { opacity: 0; transform: translateX(100px); }
        to { opacity: 1; transform: translateX(0); }
    }
    @keyframes slideOutRight {
        from { opacity: 1; transform: translateX(0); }
        to { opacity: 0; transform: translateX(100px); }
    }
`;
document.head.appendChild(style);

// ==================== FECHAR MODAIS ====================

document.getElementById('closeLogin').addEventListener('click', () => closeModal('loginModal'));
document.getElementById('closeRegister').addEventListener('click', () => closeModal('registerModal'));
document.getElementById('closeProfile').addEventListener('click', () => closeModal('profileModal'));
document.getElementById('closeCart').addEventListener('click', () => closeModal('cartModal'));
document.getElementById('closeOrders').addEventListener('click', () => closeModal('ordersModal'));
document.getElementById('closeSuccess').addEventListener('click', () => closeModal('successModal'));
document.getElementById('closeAddCart').addEventListener('click', () => closeModal('addToCartModal'));
document.getElementById('closeCheckout').addEventListener('click', () => closeModal('checkoutModal'));

// ==================== MENU E ANIMAÇÕES ====================

const hamburger = document.querySelector('.hamburger');
const navMenu = document.querySelector('.nav-menu');
const navLinks = document.querySelectorAll('.nav-menu a');

hamburger.addEventListener('click', () => {
    navMenu.classList.toggle('active');
    hamburger.classList.toggle('active');
});

navLinks.forEach(link => {
    link.addEventListener('click', () => {
        navMenu.classList.remove('active');
        hamburger.classList.remove('active');
    });
});

window.addEventListener('scroll', () => {
    const currentScroll = window.pageYOffset;
    const header = document.querySelector('.header');
    
    if (currentScroll <= 0) {
        header.style.boxShadow = '0 2px 15px rgba(0, 0, 0, 0.1)';
    } else {
        header.style.boxShadow = '0 2px 25px rgba(0, 0, 0, 0.15)';
    }
});

const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -100px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

const animateElements = document.querySelectorAll(
    '.about-card, .product-card, .service-card, .esg-card, .team-member, .stat-item'
);

animateElements.forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(30px)';
    el.style.transition = 'all 0.6s ease';
    observer.observe(el);
});

// ==================== MÁSCARAS ====================

document.getElementById('cep').addEventListener('input', (e) => {
    let value = e.target.value.replace(/\D/g, '');
    value = value.replace(/(\d{5})(\d)/, '$1-$2');
    e.target.value = value;
});

const telefoneInputs = document.querySelectorAll('input[type="tel"]');
telefoneInputs.forEach(input => {
    input.addEventListener('input', (e) => {
        let value = e.target.value.replace(/\D/g, '');
        if (value.length <= 10) {
            value = value.replace(/(\d{2})(\d)/, '($1) $2');
            value = value.replace(/(\d{4})(\d)/, '$1-$2');
        } else {
            value = value.replace(/(\d{2})(\d)/, '($1) $2');
            value = value.replace(/(\d{5})(\d)/, '$1-$2');
        }
        e.target.value = value;
    });
});

// ==================== CONTADOR ANIMADO ====================

function animateValue(element, start, end, duration, suffix = '') {
    let startTimestamp = null;
    const step = (timestamp) => {
        if (!startTimestamp) startTimestamp = timestamp;
        const progress = Math.min((timestamp - startTimestamp) / duration, 1);
        const value = Math.floor(progress * (end - start) + start);
        element.textContent = value + suffix;
        if (progress < 1) {
            window.requestAnimationFrame(step);
        }
    };
    window.requestAnimationFrame(step);
}

const statsObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const statNumber = entry.target;
            const text = statNumber.textContent;
            const number = parseInt(text);
            const suffix = text.replace(/[0-9]/g, '');
            
            if (!isNaN(number)) {
                animateValue(statNumber, 0, number, 2000, suffix);
                statsObserver.unobserve(entry.target);
            }
        }
    });
}, { threshold: 0.5 });

document.querySelectorAll('.stat-number').forEach(stat => {
    statsObserver.observe(stat);
});

// ==================== FORMULÁRIO DE CONTATO ====================

const contactForm = document.getElementById('contactForm');

if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const formData = new FormData(contactForm);
        const data = Object.fromEntries(formData);
        
        let message = `*Nova mensagem do site VivÁguas*\n\n`;
        message += `*Nome:* ${data.nome}\n`;
        message += `*CPF/CNPJ:* ${data.documento}\n`;
        message += `*E-mail:* ${data.email}\n`;
        message += `*Telefone:* ${data.telefone}\n`;
        
        if (data.endereco) {
            message += `*Endereço:* ${data.endereco}\n`;
        }
        
        message += `*Tipo:* ${data.tipo}\n`;
        
        if (data.mensagem) {
            message += `\n*Mensagem:*\n${data.mensagem}`;
        }
        
        const encodedMessage = encodeURIComponent(message);
        window.open(`https://wa.me/5511935050278?text=${encodedMessage}`, '_blank');
        
        contactForm.reset();
        showNotification('Mensagem enviada! Você será redirecionado para o WhatsApp.', 'success');
    });
}

// ==================== INICIALIZAÇÃO ====================

document.addEventListener('DOMContentLoaded', () => {
    initializeData();
});

console.log('🌱 Sistema VivÁguas carregado com sucesso!');