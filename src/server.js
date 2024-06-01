import express from "express";
import configViewEngine from "./config/viewEngine";
import configCors from "./config/cors";
import initWebRoutes from "./routes/web";
import initApiRoutes from "./routes/api";
require("dotenv").config();
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";

const app = express();
const PORT = process.env.PORT;



app.use(express.static("./public"));

//config bodyParser
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

//config cookeiParser
app.use(cookieParser());

configViewEngine(app);
configCors(app);

// connection();
initWebRoutes(app);
initApiRoutes(app);

app.use((req, res) => {
    return res.send('404 not found')
});

app.listen(PORT, () => {
    console.log(">>> app-vaeco is running on port " + PORT)
});