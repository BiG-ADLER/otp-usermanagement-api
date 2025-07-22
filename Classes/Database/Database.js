// Import Package Modules
import chalk from "chalk";
import { connect } from "mongoose";
import JWT from "jsonwebtoken";
import OTP from "otp";

// Import Modules and Classes
import Notification from "../../Modules/Notification.js";

// Import Databases Schemas
import OTP_Codes from "../../Schemas/OTP_Codes.js";
import Users from "../../Schemas/Users.js";

// Import Configs
import Config from "../../Configs/Config.js"

// Import JSON Web Tokens methods
const { sign, verify } = JWT

export default class Database {

    constructor(Username = "", Password = "") {
        this.Username = Username;
        this.Password = Password;
    }

    // Connect to MongoDB Database with creditions in .env file
    async Connect() {
        try {
            await connect(`mongodb+srv://bigadler:bigadler@levinteam.73n1f.mongodb.net/bigadler`).then(async () => {
                Notification('Database Connection Successfully Established!')
            }).catch((e) => {
                Notification(`[ Database ]: ${chalk.red('Connection Problem!')}, Error Message: ${e}`)
            })
        } catch (error) {
            Notification(`Database => Connect ${error}`)
        }
    }

    // Generate and send OTP code to client with token that have a user data for creating user in database
    async SendOTPCode({ FirstName: FirstName, LastName: LastName, PhoneNumber: PhoneNumber, Email: Email }) {
        const GenerateOTPCode = await this.GenerateOTP(PhoneNumber, Email)
        return {
            Status: {
                Code: 201,
                Message: "✅ OTP Code Generated Successfully, Please Verify Your Account"
            },
            UserToken: (await this.#GetUserToken({
                PhoneNumber: PhoneNumber,
                Email: Email,
                FirstName: FirstName,
                LastName: LastName,
                FullName: `${FirstName} ${LastName}`
            })),
            OTP_Code: GenerateOTPCode.OTP,
            DatabaseMessage: "✅ OTP Code Generated Successfully, Please Verify Your Account",
        }
    }

    // Generate OTP Code and save it into temporary database collection
    async GenerateOTP(PhoneNumber, Email) {
        try {
            const Code = new OTP({codeLength: 6})
            const Data = await new OTP_Codes({
                PhoneNumber: PhoneNumber,
                Email: Email,
                Code: Code.totp()
            });

            await Data.save().catch(async err => {
                return {
                    Status: {
                        Code: 500,
                        Message: 'Failed'
                    },
                    DatabaseMessage: `❌ An Error Happend When Creating ${Data.Code} Code, ERROR: ${err}`,
                    DatabaseAction: null
                }
            })

            return {
                Status: 200,
                OTP: Data.Code
            }

        } catch (error) {
            return {
                Status: {
                    Code: 500,
                    Message: 'Failed to Generate OTP'
                },
                Error: error.message
            };
        }
    }

    // Verify OTP code and delete code in temporary database collection and then save user data in Users collection
    async VerifyOTP({PhoneNumber: PhoneNumber, Email: Email, OTP_Code: OTP_Code, Token: Token}) {
        try {
            const VerifyOTPCode = await OTP_Codes.findOneAndDelete({PhoneNumber: PhoneNumber, Email: Email, Code: OTP_Code})

            if (VerifyOTPCode) {

                const UserData = await Users.findOne({PhoneNumber: PhoneNumber})
                if (!UserData) {
                    const Data = await new Users({
                        FirstName: verify(Token, Config.Key).UserFirstName,
                        LastName: verify(Token, Config.Key).UserLastName,
                        PhoneNumber: verify(Token, Config.Key).UserPhoneNumber,
                        Email: verify(Token, Config.Key).UserEmail
                    })

                    await Data.save().catch(async err => {
                        return {
                            Status: {
                                Code: 500,
                                Message: 'Failed'
                            },
                            DatabaseMessage: `❌ An Error Happend When Creating ${PhoneNumber} User, ERROR: ${err}`,
                            DatabaseAction: null
                        }
                    })

                    return {
                        Status: {
                            Code: 201,
                            Message: 'Created'
                        },
                        UserData: {
                            UserPhoneNumber: PhoneNumber,
                            UserEmail: Email,
                            UserFirstName: (await Users.findOne({PhoneNumber: PhoneNumber})).FirstName,
                            UserLastName: (await Users.findOne({PhoneNumber: PhoneNumber})).LastName,
                            UserFullName: `${(await Users.findOne({PhoneNumber: PhoneNumber})).FirstName} ${(await Users.findOne({PhoneNumber: PhoneNumber})).LastName}`
                        },
                        UserToken: (await this.#GetUserToken({
                            PhoneNumber: (await Users.findOne({PhoneNumber: PhoneNumber})).PhoneNumber,
                            Email: (await Users.findOne({PhoneNumber: PhoneNumber})).Email,
                            FirstName: (await Users.findOne({PhoneNumber: PhoneNumber})).FirstName,
                            LastName: (await Users.findOne({PhoneNumber: PhoneNumber})).LastName,
                            FullName: `${(await Users.findOne({PhoneNumber: PhoneNumber})).FirstName} ${(await Users.findOne({PhoneNumber: PhoneNumber})).LastName}`
                        })),
                        DatabaseMessage: `✅ User Account ${PhoneNumber} Has Been Created Successfully`,
                        DatabaseAction: null
                    }

                } else {
                    return {
                        Status: {
                            Code: 200,
                            Message: 'Your Account Already Exists'
                        },
                        UserData: {
                            UserPhoneNumber: PhoneNumber,
                            UserFirstName: FirstName,
                            UserLastName: LastName,
                            UserEmail: Email,
                            UserFullName: `${FirstName} ${LastName}`
                        },
                        UserToken: (await this.#GetUserToken({
                            PhoneNumber: (await Users.findOne({PhoneNumber: PhoneNumber})).PhoneNumber,
                            Email: (await Users.findOne({PhoneNumber: PhoneNumber})).Email,
                            FirstName: (await Users.findOne({PhoneNumber: PhoneNumber})).FirstName,
                            LastName: (await Users.findOne({PhoneNumber: PhoneNumber})).LastName,
                            FullName: `${(await Users.findOne({PhoneNumber: PhoneNumber})).FirstName} ${(await Users.findOne({PhoneNumber: PhoneNumber})).LastName}`
                        })),
                        DatabaseMessage: `✅ User Account ${PhoneNumber} Has Been Already Exists`,
                        DatabaseAction: null
                    }
                }
            } else {
                return {
                    Status: {
                        Code: 400,
                        Message: 'Invalid OTP Code'
                    },
                    DatabaseMessage: `❌ OTP Code ${OTP_Code} Is Invalid or Expired`,
                    DatabaseAction: null
                }
            }

        } catch (error) {
            return {
                Status: {
                    Code: 500,
                    Message: 'Failed to Generate OTP'
                },
                Error: error.message
            };
        }
    }

    // Generate JWT token for storing User datas
    async #GetUserToken({PhoneNumber: PhoneNumber, FirstName: FirstName, LastName: LastName, FullName: FullName, Email: Email}) {
        const UserDataToken = await sign({
            UserPhoneNumber: PhoneNumber,
            UserFirstName: FirstName,
            UserLastName: LastName,
            UserFullName: FullName,
            UserEmail: Email
        }, Config.Key)

        return UserDataToken
    }
}