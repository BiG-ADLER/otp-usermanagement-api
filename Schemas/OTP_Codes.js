import { Schema, model } from "mongoose";

const OTP_Codes = new Schema({
    PhoneNumber: {
        type: Schema.Types.Mixed,
        required: true,
        default: 'Invalid Phone number'
    },

    Email: {
        type: String,
        required: true,
        default: 'Unknown Email'
    },

    Code: {
        type: Number,
        required: true,
        default: 'Invalid OTP Code'
    },
})

export default model('OTP_Codes', OTP_Codes)