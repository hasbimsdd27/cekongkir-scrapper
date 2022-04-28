const express = require("express");
const { GetQueryLocation, GetDataOngkir } = require("./libs/scrapper");

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

const PORT = process.env.PORT || 5000;

app.get("/search", async (req, res) => {
  const location = req.query.location;
  try {
    const result = await GetQueryLocation(location);

    return res.status(result.status === "success" ? 200 : 400).send(result);
  } catch (error) {
    return res.status(500).send({
      status: "error",
      message: error.message,
    });
  }
});

app.post("/cost", async (req, res) => {
  try {
    const {
      origin,
      origin_type,
      destination,
      destination_type,
      weight,
      courier,
    } = req.body;

    if (
      !origin ||
      !origin_type ||
      !destination ||
      !destination_type ||
      !weight ||
      !courier
    ) {
      return res.status(400).send({
        status: "error",
        message: "please inpul all required field",
      });
    }

    if (courier.length === 0) {
      return res.status(400).send({
        status: "error",
        message: "courier can't be empty",
      });
    }

    const availableCourier = ["jne", "tiki", "pos", "wahana", "sicepat", "jnt"];

    const body = [
      `origin=${origin}`,
      `originType=${origin_type}`,
      `destination=${destination}`,
      `destinationType=${destination_type}`,
      `weight=${weight}`,
      `courier=${courier
        .filter((item) => availableCourier.includes(item))
        .join(":")}`,
    ].join("&");

    const result = await GetDataOngkir(body);

    return res.status(result.status === "success" ? 200 : 400).send(result);
  } catch (error) {
    return res.status(500).send({
      status: "error",
      message: error.message,
    });
  }
});

app.listen(PORT, () => {
  console.log(`app running on port`, PORT);
});
