// const https = require("https");
import https from "https";
import bodyParser from "body-parser";

const fs = require("fs");
const options = {
  key: fs.readFileSync(__dirname + "/localhost-key.pem"),
  cert: fs.readFileSync(__dirname + "/localhost.pem"),
};

import express from "express";
import { shippingLabel } from "./shipping-label";

// set express and port
const app = express();
const port = 3000;

// Parse application/json
app.use(bodyParser.json());
// Parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true }));

// set some routes. also a form to test the shippingLabel function
app.get("/", (req: express.Request, res: express.Response) => {
  res.send(`
  <form action="/get-label" method="post">
    <label for="company">Company:</label>
    <input type="text" id="company" name="return_address[company]" value="CODE Internet Applications"><br><br>
    
    <label for="address">Address:</label>
    <input type="text" id="address" name="return_address[address]" value="Frederik Matthesstraat 30"><br><br>
    
    <label for="zip_code">Zip Code:</label>
    <input type="text" id="zip_code" name="return_address[zip_code]" value="2613 ZZ"><br><br>
    
    <label for="city">City:</label>
    <input type="text" id="city" name="return_address[city]" value="Delft"><br><br>
    
    <label for="country">Country:</label>
    <input type="text" id="country" name="return_address[country]" value="The Netherlands"><br><br>
    
    <label for="order">Order:</label>
    <input type="text" id="order" name="order" value="CODE-1339"><br><br>
    
    <label for="name">Name:</label>
    <input type="text" id="name" name="name" value="Test User"><br><br>
    
    <label for="language">Language:</label>
    <input type="text" id="language" name="language" value="en"><br><br>
    
    <button type="submit">Submit</button>
  </form>
`);
});

app.post("/get-label", shippingLabel);
// app.route("/get-label").get(shippingLabel).post(shippingLabel);

var secure = https.createServer(options, app); // for express
secure.listen(port);

// app.listen(port, () => {
//   console.log(`[server]: Server is running at http://localhost:${port}`);
// });
