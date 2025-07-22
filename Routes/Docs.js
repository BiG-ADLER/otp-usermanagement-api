// Import Packages
import express from "express";
import csurf from "csurf";
import Throttle from "express-throttle/lib/throttle.js";
import { serve, setup } from "swagger-ui-express";

import Swagger from "../swagger.js";
// Import Package Classes
const Router = express.Router();


Router.use('/docs', serve);
Router.get('/docs', setup(Swagger, {explorer: true}));

export default Router