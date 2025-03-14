import {
    PutObjectCommand,
    ListObjectsV2Command,
    GetObjectCommand
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';
import { AWS_BUCKET_NAME } from '../config.js';
import { s3Client } from './s3Config.js';

// Función para mostrar la página principal combinada
export const getHomePage = (req, res) => {
    res.render('home'); // Una sola vista que incluye tanto el formulario como la galería
};

// Función para subir una imagen a S3
export const uploadImage = async (req, res) => {
    try {
        if (!req.files || !req.files.image) {
            return res.status(400).json({ success: false, message: 'No se ha subido ninguna imagen' });
        }

        const file = req.files.image;
        const fileExtension = path.extname(file.name);
        const fileName = `${uuidv4()}${fileExtension}`;

        // Configurar el comando para subir el objeto a S3
        const uploadParams = {
            Bucket: AWS_BUCKET_NAME,
            Key: `publico/${fileName}`,
            Body: file.data,
            ContentType: file.mimetype
        };

        // Ejecutar el comando para subir el archivo
        await s3Client.send(new PutObjectCommand(uploadParams));
        
        // Devolver una respuesta JSON para que pueda ser procesada por AJAX
        res.json({ 
            success: true, 
            message: 'Imagen subida exitosamente', 
            fileName,
            url: `https://${AWS_BUCKET_NAME}.s3.amazonaws.com/publico/${fileName}`
        });
    } catch (error) {
        console.error('Error al subir la imagen:', error);
        res.status(500).json({ success: false, message: 'Error al subir la imagen' });
    }
};

// Función para obtener la galería de imágenes (como JSON para AJAX)
export const getGalleryImages = async (req, res) => {
    try {
        // Configurar el comando para listar objetos en el bucket con el prefijo publico/
        const listParams = {
            Bucket: AWS_BUCKET_NAME,
            Prefix: 'publico/'
        };

        // Ejecutar el comando para listar los objetos
        const data = await s3Client.send(new ListObjectsV2Command(listParams));

        if (!data.Contents || data.Contents.length === 0) {
            return res.json({ images: [] });
        }

        // Filtrar solo archivos de imagen
        const imageKeys = data.Contents
            .filter(item => {
                const ext = path.extname(item.Key).toLowerCase();
                return ['.jpg', '.jpeg', '.png', '.gif'].includes(ext);
            })
            .map(item => item.Key);
        
        // Generar URLs firmadas para cada imagen
        const images = await Promise.all(
            imageKeys.map(async (key) => {
                const command = new GetObjectCommand({
                    Bucket: AWS_BUCKET_NAME,
                    Key: key
                });
                
                // Crear URL firmada que expira en 1 hora
                const url = await getSignedUrl(s3Client, command, { expiresIn: 3600 });
                return {
                    key,
                    url,
                    filename: key.split('/').pop() // Obtener solo el nombre del archivo sin la ruta
                };
            })
        );

        return res.json({ images });
    } catch (error) {
        console.error('Error al cargar las imágenes:', error);
        res.status(500).json({ success: false, message: 'Error al cargar las imágenes', images: [] });
    }
};