import Joi from "joi";
import { User } from "../models";
import CustomErrorHandler from "../services/CustomErrorHandler";
import bcrypt from 'bcrypt'

const login = async (req, res, next) => {

    const loginSchema = Joi.object({
        email: Joi.string().email().required(),
        password: Joi.string().pattern(new RegExp('^[a-zA-Z0-9]{3,30}$'))
    })

    const { error } = loginSchema.validate(req.body)

    if (error) {
        return next(error);
    }

    try {
        const user = await User.findOne({ email: req.body.email })
        if (!user) {
            return next(CustomErrorHandler.wrongCredentials())
        }

        const match = await bcrypt.compare(req.body.password, user.password)

        if (!match) {
            return next(CustomErrorHandler.wrongCredentials())
        }
        
        next()

    } catch (err) {
        return next(err)
    }
}

export default login