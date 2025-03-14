import {Router} from 'express';
import {  getGalleryImages, getHomePage, uploadImage } from './controller.js';
import fileUploadMiddleware from './middleware.js';


const router = Router();

// Rutas para la aplicación
router.get('/', getHomePage);
router.post('/upload', fileUploadMiddleware, uploadImage);
router.get('/images', getGalleryImages); 
export default router;