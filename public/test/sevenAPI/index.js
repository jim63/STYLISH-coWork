const express = require("express");
const app = express();
app.set("view engine", "pug");
app.use(express.static("public"));
app.set("view engine", "pug");

app.listen(3000, () => {
  console.log("the app is rumming on localhost:3000");
});

const request = require("request");

app.get("/getStories", (req, res) => {
  let zipCode = req.query.zipcode;

  request.post(
    {
      headers: { "content-type": "application/x-www-form-urlencoded" },
      url: "http://www.ibon.com.tw/retail_inquiry_ajax.aspx",
      form: { strTargetField: "ZIPCODE", strKeyWords: zipCode }
    },
    function(error, response, body) {
      // console.log(response);
      res.json({
        data: `${body}`
      });
    }
  );
});
