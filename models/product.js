import mongoose from 'mongoose';
import { APP_URL } from '../config';
const Schema = mongoose.Schema;

const productSchema = new Schema({
    name: {type: String, required: true},
    price: {type: Number, reuired: true},
    size: {type: String, required: true},
    image: {type: String, required: true, get: (image)=>{
        // http://localhost:5000/uploads/235416232645-12353452345.png
        let url = `${APP_URL}/${image}`
        if(url.includes("\\") == true){
            url = url.replace("\\","/")
            // console.log(url);
            return url
        }
        // console.log(url);
        return url;
    }}
}, {timestamps: true, toJSON: {getters: true}})
// }, {timestamps: true, toJSON: {getters: true}, _id: false})

export default mongoose.model('Product', productSchema, 'products');
