const app = require('express')();
const bodyParser = require('body-parser');

app.set("api_secret_key", require("./config").api_secret_key);
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use("/users", require("./controllers/userController"))

app.listen(process.env.PORT || 5000, () => console.log(`Server started on port ${process.env.PORT || 5000}`));