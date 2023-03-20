import CustomErrorHandler from "../services/CustomErrorHandler";
import JwtService from "../services/JwtServices";
import { User as user} from "../models"


const auth = async (req, res, next)=>{
    let authHeader = req.headers.authorization
    // console.log(authHeader);

    if(!authHeader){
        return next(CustomErrorHandler.unAuthorized())
    }

    let token = authHeader.split(' ')[1];
    // console.log(token);

    try {
        const {_id, role} = await JwtService.verify(token)
        let user = {
            _id,
            role
        };

        req.user = user;
        next()



    } catch (err) {
        console.log(err);
        return next(CustomErrorHandler.unAuthorized())
        
    }
}

export default auth