import Create from "./Swagger/Examples/Create.js"
import Verify from "./Swagger/Examples/Verify.js"

const Swagger = {
    "swagger": "2.0",
    "info": {
        "title": "User Management Api with OTP Code",
        "description": "",
        "version": "1.0"
    },
    "produces": ["application/json"],
    "paths": {
        "/api/v1/user/create": {
            "post": {
                "x-swagger-router-controller": "home",
                "operationId": "createcode",
                "tags": ["Create OTP Code with Data"],
                "description": "<h2>Generate and send OTP code to client with token that have a user data for creating user in database</h2>",
                "parameters": [
					{
                        "name": "JSON Body form",
						"description": "Send Data like firstname, lastname, email, phonenumber and recive JSON Object data that include OTP Code and message with verify URL link.",
                        "in": "body",
                        "type": "string",
						"required": true,
						"example": Create
                    }
                ],
                "responses": {
					"201": {
						"description": `Send JSON object that include Data with verify URL and Code with OTP Code and send code in console`
					}
				}
            }
        },
        "/api/v1/user/verify": {
            "post": {
                "x-swagger-router-controller": "bar",
                "operationId": "verify",
                "tags": ["Verify OTP Code"],
                "description": "<h2>Send Data like email, phone, token then if verify action has been successfull, temp otp data in database has been deleted and user data save into Users database collection then return User saved data Object and user data token. </h2>",
                "parameters": [
					{
                        "name": "email",
						"description": "Send email in query parameter option",
                        "in": "query",
                        "type": "string",
						"required": true,
						"example": Verify.email,
						"value": Verify.email
                    },
					{
                        "name": "phone",
						"description": "Send phone number in query parameter option",
                        "in": "query",
                        "type": "string",
						"required": true,
						"example": Verify.phone,
						"value": Verify.phone
                    },
					{
                        "name": "code",
						"description": "Send OTP Code in query parameter option",
                        "in": "query",
                        "type": "integer",
						"required": true,
						"example": Verify.code,
						"value": Verify.code
                    },
					{
                        "name": "token",
						"description": "Send User data JWT Token in query parameter option",
                        "in": "query",
                        "type": "string",
						"required": true,
						"example": Verify.token,
						"value": Verify.token
                    },
                ],
                "responses": {
					"201": {
						"description": `Create and save user data into database and return user data, user data JWT token.`
					}
				}
            }
        }
    }
}

export default Swagger