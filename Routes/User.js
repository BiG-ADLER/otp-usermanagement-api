// Import Packages
import express from "express";

// Import Package Classes
const Router = express.Router();

// Import Classes
import Database from "../Classes/Database/Database.js";

const Data = new Database();

// POST user data and Generate OTP Code and return JSON obejct that include OTP Code and user token and verify URL.
Router.post('/create', async (req, res, next) => {
    const {FirstName, LastName, PhoneNumber, Email} = req.body

    if ((typeof FirstName && typeof LastName && typeof PhoneNumber && typeof Email) == "string") {
        if (FirstName.length >= 3 && FirstName.length <= 20) {
                if (LastName.length >= 3 && LastName.length <= 20) {
                    if (PhoneNumber.length >= 10 && PhoneNumber.length <= 13) {
                        if (Email.length >= 14 && Email.length <= 50) {
                            await Data.SendOTPCode({
                                FirstName: FirstName,
                                LastName: LastName,
                                PhoneNumber: PhoneNumber,
                                Email: Email
                            }).then(async message => {
                                switch (message.Status.Code) {
                                    case 201:
                                        console.log({
                                            Code: message.OTP_Code
                                        });
                                        res.status(201).json({
                                            Data: `لطفا برای ساخته شدن حساب کاربری خود روی لینک زیر کلیک کنید و شماره تماس خود را تایید کنید, http://localhost:3000/api/v1/user/verify?phone=${PhoneNumber}&email=${Email}&token=${message.UserToken}&code=${message.OTP_Code} .`,
                                            Code: message.OTP_Code,
                                            Token: message.UserToken
                                        })
                                    break;

                                    default:break;
                                }
                            })
                        } else {
                            res.status(400).json({
                                Data: `ایمیل باید بین 14 تا 50 حرف باشد.`
                            })
                        }
                    } else {
                        res.status(400).json({
                            Data: `شماره تلفن باید بین 10 تا 13 عدد باشد.`
                        })
                    }
                } else {
                    res.status(400).json({
                        Data: `نام خانوادگی باید بین 3 تا 20 حروف باشد.`,
                    })
                }
        } else { 
            res.status(400).json({
                Data: `نام باید بین 3 تا 20 حروف باشد.`,
            })
        }
    } else {
        res.status(400).json({
            Data: `مقدار یکی از ورودی ها اشتباه است.`,
        })
    }
})

// POST verify user data with email, phone number, and OTP code , then save user data in JWT token into database and delete temp OTP code in database 
Router.post('/verify', async (req, res, next) => {
    const {phone, email, token, code} = req.query

    await Data.VerifyOTP({
        Email: email,
        PhoneNumber: phone,
        Token: token,
        OTP_Code: code
    }).then(async message => {
        switch (message.Status.Code) {
            case 201:
                res.status(201).json({
                    Data: `اکانت با شماره ${phone} با موفقیت ساخته شد.`,
                    UserData: message.UserData,
                    UserToken: message.UserToken
                })
            break;

            case 500:
                res.status(500).json({
                    Data: `${message.DatabaseMessage}`,
                    Message: message.DatabaseMessage
                })
            break;

            default:break;
        }
    })
})

export default Router