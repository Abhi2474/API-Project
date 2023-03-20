import { Product } from "../models"
import multer from "multer";
import path from 'path';
import CustomErrorHandler from "../services/CustomErrorHandler";
import Joi from "joi";
import fs from "fs";
import productSchema from "../validators/productValidator";

const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, 'uploads/'),
    filename: (req, file, cb) => {
        // creating a unique name
        const uniqueName = `${Date.now()}-${Math.random() * 1E9}${path.extname(file.originalname)}`
        cb(null, uniqueName)
    }
})

const handleMultipartData = multer({ storage, limits: { fileSize: 1000000 * 5 } }).single('image')

const productController = {
    async store(req, res, next) {
        // Multipart form data
        handleMultipartData(req, res, async (err) => {
            if (err) {
                console.log(err);
                return next(CustomErrorHandler.serverError())
            }
            // console.log(req.file);
            const filePath = req.file.path;
            // console.log(filePath);


            const { error } = productSchema.validate(req.body)

            if (error) {
                // delete the uploaded image or file
                fs.unlink(`${appRoot}/${filePath}`, (err) => {
                    if (err) {
                        return next(CustomErrorHandler.serverError())
                    }
                })

                // console.log(error);
                return next(error)
            }

            const { name, price, size } = req.body;
            let document;
            try {
                document = await Product.create({
                    name,
                    price,
                    size,
                    image: filePath
                })
            } catch (err) {
                console.log(err);
                return next(err)
            }

            res.status(201).json(document)
        })
    },

    async update(req, res, next) {
        handleMultipartData(req, res, async (err) => {
            if (err) {
                console.log(err);
                return next(CustomErrorHandler.serverError())
            }
            // console.log(req.file);
            let filePath;
            if (req.file) {
                filePath = req.file.path;
            }



            const { error } = productSchema.validate(req.body)

            if (error) {
                // delete the uploaded image or file
                if (req.file) {
                    fs.unlink(`${appRoot}/${filePath}`, (err) => {
                        if (err) {
                            return next(CustomErrorHandler.serverError())
                        }
                    })

                    return next(error)
                }
            }

            const { name, price, size } = req.body;
            let document;
            try {
                document = await Product.findOneAndUpdate({ _id: req.params.id }, {
                    name,
                    price,
                    size,
                    ...(req.file && { image: filePath })
                }, { new: true })
                // console.log(document);
            } catch (err) {
                return next(err)
            }

            res.status(201).json(document)
        })
    },
    async destroy(req, res, next) {
        const document = await Product.findOneAndRemove({ _id: req.params.id })
        if (!document) {
            // console.log(document);
            return next(new Error("Nothing to delete"))
        }
        // Image Delete
        const imagePath = document._doc.image;

        fs.unlink(`${appRoot}/${imagePath}`, (err) => {
            if (err) {
                return next(CustomErrorHandler.serverError())
            }
        })

        res.json(document)
    },

    async index(req, res, next) {
        let documents;
        // for pagination you can use mongoose-pagination

        try {
            documents = await Product.find().select('-updatedAt -__v').sort({_id: -1});

        } catch (error) {
            return next(CustomErrorHandler.serverError())
        }
        return res.json(documents)
    },

    async show(req, res, next) {
        let documents;
        // for pagination you can use mongoose-pagination

        try {
            documents = await Product.findOne({ _id: req.params.id }).select('-updatedAt -__v');

        } catch (error) {
            return next(CustomErrorHandler.serverError())
        }
        return res.json(documents)
    },
    // This function added later for the cart-items end point
    async getProducts(req, res, next) {
        let documents;
        try {
            documents = await Product.find({
                _id: { $in: req.body.ids },
            }).select('-updatedAt -__v');
        } catch (err) {
            console.log(err);
            return next(CustomErrorHandler.serverError());
        }
        return res.json(documents);
    }
}

export default productController;