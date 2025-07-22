import { Schema, model } from "mongoose";

const Users = new Schema({
    FirstName: {
        type: String,
        required: true,
        default: 'Unknown Name'
    },

    LastName: {
        type: String,
        required: true,
        default: 'Unknown Last name'
    },

    PhoneNumber: {
        type: Schema.Types.Mixed,
        required: true,
        default: 'Invalid Phone number'
    },

    Email: {
        type: String,
        required: true,
        default: 'Unknown Email'
    }
})

Users.statics.isPhoneNumberEnable = async (PhoneNumber) => {
    const Status = await this.findOne({PhoneNumber})

    if (Status) return false
    return true;
}

export default model('Users', Users)