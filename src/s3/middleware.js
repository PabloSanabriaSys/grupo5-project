import fileUpload from 'express-fileupload';

// Configuración de express-fileupload
const fileUploadMiddleware = fileUpload({
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB máximo
    abortOnLimit: true,
    createParentPath: true,
    useTempFiles: false,
    safeFileNames: true,
    preserveExtension: true,

    // Validar tipos de archivos en el middleware
    uploadValidator: (req, res, next) => {
        // Si no hay archivo, continuar
        if (!req.files || !req.files.image) {
            return next();
        }

        const file = req.files.image;
        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];

        if (!allowedTypes.includes(file.mimetype)) {
            return res.status(400).render('upload', {
                error: 'Formato de archivo no válido. Solo se permiten JPEG, JPG, PNG y GIF.'
            });
        }

        next();
    }
});

export default fileUploadMiddleware;