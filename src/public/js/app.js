document.addEventListener('DOMContentLoaded', function() {
    // Elementos del DOM
    const uploadForm = document.getElementById('uploadForm');
    const imageInput = document.getElementById('imageInput');
    const previewContainer = document.getElementById('previewContainer');
    const successAlert = document.getElementById('successAlert');
    const errorAlert = document.getElementById('errorAlert');
    const galleryContainer = document.getElementById('galleryContainer');
    const refreshGallery = document.getElementById('refreshGallery');
    const loadingUpload = document.getElementById('loadingUpload');
    const loadingGallery = document.getElementById('loadingGallery');
    const noImages = document.getElementById('noImages');
    const dropArea = document.getElementById('dropArea');
    const searchImages = document.getElementById('searchImages');
    const uploadFirstImage = document.getElementById('uploadFirstImage');
    const imageModal = document.getElementById('imageModal');
    const modalImage = document.getElementById('modalImage');
    const modalImageName = document.getElementById('modalImageName');
    const closeModal = document.getElementById('closeModal');
    const downloadImage = document.getElementById('downloadImage');
    const copyImageUrl = document.getElementById('copyImageUrl');
    
    // Función para mostrar vista previa de la imagen
    imageInput.addEventListener('change', function() {
        showImagePreview(this.files[0]);
    });
    
    // Hacer que el área de drop sea clickeable
    dropArea.addEventListener('click', function(e) {
        // Asegurarse de que no se haga clic en el input directamente
        if (e.target !== imageInput) {
            imageInput.click();
        }
    });
    
    // Soporte para arrastrar y soltar imágenes
    dropArea.addEventListener('dragover', function(e) {
        e.preventDefault();
        dropArea.classList.add('border-primary-400');
        dropArea.classList.add('bg-gray-750');
    });
    
    dropArea.addEventListener('dragleave', function() {
        dropArea.classList.remove('border-primary-400');
        dropArea.classList.remove('bg-gray-750');
    });
    
    dropArea.addEventListener('drop', function(e) {
        e.preventDefault();
        dropArea.classList.remove('border-primary-400');
        dropArea.classList.remove('bg-gray-750');
        
        if (e.dataTransfer.files.length) {
            imageInput.files = e.dataTransfer.files;
            showImagePreview(e.dataTransfer.files[0]);
        }
    });
    
    // Función para mostrar la vista previa
    function showImagePreview(file) {
        if (!file) return;
        
        previewContainer.innerHTML = '';
        
        if (file.type.startsWith('image/')) {
            const reader = new FileReader();
            
            reader.onload = function(e) {
                // Crear contenedor con dimensiones fijas
                const previewWrapper = document.createElement('div');
                previewWrapper.className = 'preview-container rounded-lg overflow-hidden shadow-md relative';
                
                // Crear imagen con object-fit para mantener proporción
                const img = document.createElement('img');
                img.src = e.target.result;
                img.className = 'preview-image rounded-lg';
                img.alt = file.name;
                
                // Botón para eliminar vista previa
                const removeBtn = document.createElement('button');
                removeBtn.className = 'absolute top-2 right-2 bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center';
                removeBtn.innerHTML = '<i class="fas fa-times"></i>';
                removeBtn.addEventListener('click', function(e) {
                    e.stopPropagation();
                    previewContainer.innerHTML = '';
                    imageInput.value = '';
                });
                
                previewWrapper.appendChild(img);
                previewWrapper.appendChild(removeBtn);
                previewContainer.appendChild(previewWrapper);
            };
            
            reader.readAsDataURL(file);
        }
    }
    
    // Manejar envío del formulario
    uploadForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        if (!imageInput.files.length) {
            showAlert(errorAlert, 'Por favor selecciona una imagen');
            return;
        }
        
        const formData = new FormData();
        formData.append('image', imageInput.files[0]);
        
        // Mostrar cargando
        loadingUpload.classList.remove('hidden');
        
        // Simulación de carga - Reemplazar con la API real
        setTimeout(() => {
            loadingUpload.classList.add('hidden');
            showAlert(successAlert, 'Imagen subida correctamente');
            uploadForm.reset();
            previewContainer.innerHTML = '';
            loadGallery();
        }, 1500);
        
        // Código para la API real (comentado)
        
        fetch('/upload', {
            method: 'POST',
            body: formData
        })
        .then(response => response.json())
        .then(data => {
            loadingUpload.classList.add('hidden');
            
            if (data.success) {
                showAlert(successAlert, data.message);
                uploadForm.reset();
                previewContainer.innerHTML = '';
                
                // Actualizar galería
                loadGallery();
            } else {
                showAlert(errorAlert, data.message || 'Error al subir la imagen');
            }
        })
        .catch(error => {
            loadingUpload.classList.add('hidden');
            showAlert(errorAlert, 'Error de conexión');
            console.error('Error:', error);
        });
        
    });
    
    // Para "Subir primera imagen" en el estado vacío
    if (uploadFirstImage) {
        uploadFirstImage.addEventListener('click', function() {
            imageInput.click();
        });
    }
    
    // Función para mostrar alertas
    function showAlert(alertElement, message) {
        const messageSpan = alertElement.querySelector('span');
        messageSpan.textContent = message;
        
        alertElement.classList.remove('hidden');
        
        setTimeout(() => {
            alertElement.classList.add('opacity-0');
            
            setTimeout(() => {
                alertElement.classList.add('hidden');
                alertElement.classList.remove('opacity-0');
            }, 300);
        }, 3000);
    }
    
    // Filtrar imágenes por búsqueda
    searchImages.addEventListener('input', function() {
        const searchTerm = this.value.toLowerCase().trim();
        const items = galleryContainer.querySelectorAll('.gallery-item');
        
        items.forEach(item => {
            const filename = item.dataset.filename.toLowerCase();
            if (filename.includes(searchTerm)) {
                item.parentElement.style.display = '';
            } else {
                item.parentElement.style.display = 'none';
            }
        });
    });
    
    // Función para cargar la galería
    function loadGallery() {
        loadingGallery.classList.remove('hidden');
        galleryContainer.innerHTML = '';
        noImages.classList.add('hidden');
        
        
        
        // Código para la API real (comentado)
        
        fetch('/images')
            .then(response => response.json())
            .then(data => {
                loadingGallery.classList.add('hidden');
                
                if (data.images && data.images.length > 0) {
                    renderGallery(data.images);
                } else {
                    noImages.classList.remove('hidden');
                }
            })
            .catch(error => {
                loadingGallery.classList.add('hidden');
                showAlert(errorAlert, 'Error al cargar las imágenes');
                console.error('Error:', error);
            });
        
    }
    
    // Renderizar la galería de imágenes
    function renderGallery(images) {
        galleryContainer.innerHTML = '';
        
        if (images.length === 0) {
            noImages.classList.remove('hidden');
            return;
        }
        
        noImages.classList.add('hidden');
        
        images.forEach(image => {
            const col = document.createElement('div');
            
            col.innerHTML = `
                <div class="bg-gray-700 rounded-lg overflow-hidden shadow-lg transition-all duration-300 hover:shadow-xl gallery-item" data-filename="${image.filename}">
                    <div class="gallery-image-container">
                        <img src="${image.url}" alt="${image.filename}" loading="lazy" class="gallery-image">
                        <div class="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300 flex items-end justify-between">
                            <div class="p-3 w-full">
                                <div class="flex justify-between items-center">
                                    <div class="flex space-x-1">
                                        <button class="p-1.5 bg-primary-600 hover:bg-primary-500 rounded text-white text-xs" data-action="view" title="Ver">
                                            <i class="fas fa-eye"></i>
                                        </button>
                                        <button class="p-1.5 bg-gray-800 hover:bg-gray-700 rounded text-white text-xs" data-action="copy" title="Copiar URL">
                                            <i class="fas fa-link"></i>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="px-3 py-2 truncate">
                        <p class="text-xs text-gray-300 truncate">${image.filename}</p>
                    </div>
                </div>
            `;
            
            // Agregar eventos
            const viewBtn = col.querySelector('[data-action="view"]');
            viewBtn.addEventListener('click', function(e) {
                e.stopPropagation();
                openImageModal(image);
            });
            
            const copyBtn = col.querySelector('[data-action="copy"]');
            copyBtn.addEventListener('click', function(e) {
                e.stopPropagation();
                navigator.clipboard.writeText(image.url).then(() => {
                    showAlert(successAlert, 'URL copiada al portapapeles');
                });
            });
            
            // Hacer que toda la card sea clickeable para ver la imagen
            const card = col.querySelector('.gallery-item');
            card.addEventListener('click', function(e) {
                if (!e.target.closest('button')) {
                    openImageModal(image);
                }
            });
            
            galleryContainer.appendChild(col);
        });
    }
    
    // Abrir modal de imagen
    function openImageModal(image) {
        modalImage.src = image.url;
        modalImageName.textContent = image.filename;
        downloadImage.setAttribute('data-url', image.url);
        downloadImage.setAttribute('data-filename', image.filename);
        copyImageUrl.setAttribute('data-url', image.url);
        
        imageModal.classList.remove('hidden');
        imageModal.classList.add('flex');
        document.body.style.overflow = 'hidden';
    }
    
    // Cerrar modal
    closeModal.addEventListener('click', closeImageModal);
    
    imageModal.addEventListener('click', function(e) {
        if (e.target === imageModal) {
            closeImageModal();
        }
    });
    
    function closeImageModal() {
        imageModal.classList.add('hidden');
        imageModal.classList.remove('flex');
        document.body.style.overflow = '';
    }
    
    // Descargar imagen
    downloadImage.addEventListener('click', function() {
        const url = this.getAttribute('data-url');
        const filename = this.getAttribute('data-filename');
        
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        
        showAlert(successAlert, 'Imagen descargada correctamente');
    });
    
    // Copiar URL
    copyImageUrl.addEventListener('click', function() {
        const url = this.getAttribute('data-url');
        
        navigator.clipboard.writeText(url).then(() => {
            showAlert(successAlert, 'URL copiada al portapapeles');
        });
    });
    
    // Escuchar clic en el botón de actualizar
    refreshGallery.addEventListener('click', loadGallery);
    
    // Formatear tamaño de archivo
    function formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }
    
    // Generar imágenes de prueba
    function generarImagenesPrueba(cantidad) {
        const imagenes = [];
        
        for (let i = 1; i <= cantidad; i++) {
            // Usar imágenes de picsum.photos para ejemplos
            imagenes.push({
                id: i,
                filename: `imagen-${i}.jpg`,
                url: `https://picsum.photos/seed/${i}/800/600`,
                size: Math.floor(Math.random() * 3 * 1024 * 1024) + 500000, // Entre 500KB y 3.5MB
                date: new Date(Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000).toISOString()
            });
        }
        
        return imagenes;
    }
    
    // Cargar imágenes al iniciar
    loadGallery();
});