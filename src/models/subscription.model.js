import mongoose, {Schema, Types} from "mongoose";


const subscriptionSchema = new Schema({
    subscribe:{
        type: Schema.Types.ObjectId, // one who is subscribing our channel
        ref:"User"
    },
    channel:{
        type:Schema.Types.ObjectId ,// chnnel name 
        ref:"User"
    }

},{timestamps:true})


export const Subscription = mongoose.model("Subscription" ,subscriptionSchema)