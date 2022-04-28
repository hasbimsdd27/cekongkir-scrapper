const fetch = require("node-fetch");
const cheerio = require("cheerio");

exports.GetDataOngkir = async (body = "") => {
  const response = await fetch("https://cek-ongkir.com/cost", {
    method: "POST",
    headers: {
      Accept: "text/html, */*; q=0.01",
      "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
    },
    body,
  });

  const result = await response.text();

  const $ = cheerio.load(result);

  const resultOngkir = $("div[class='panel panel-default']")
    .text()
    .replace(/\t/g, "")
    .split("\n")
    .filter((item) => item !== "" && item !== " ");
  if (resultOngkir.includes("Hasil Pecarian")) {
    const JSONdata = { kurir: {} };
    resultOngkir.forEach((item, index) => {
      if (item !== "Hasil Pecarian" && index <= 6) {
        if (index % 2 === 0) {
          JSONdata[resultOngkir[index - 1].toLocaleLowerCase()] = item;
        } else {
          JSONdata[item.toLocaleLowerCase()] = "";
        }
      } else if (item !== "Hasil Pecarian" && index > 6) {
        if (
          !item.includes("hari") &&
          !item.includes("Rp.") &&
          !item.includes("HARI")
        ) {
          JSONdata.kurir[item] = {
            nama: item.split("[")[0],
            kode_layanan: item.split("[")[1].split("]")[0].trim(),
            nama_layanan: item.split("]")[1].trim(),
          };
        } else if (item.includes("hari") || item.includes("HARI")) {
          JSONdata.kurir[resultOngkir[index - 2]].ETA = item.toLowerCase();
        } else if (item.includes("Rp.")) {
          JSONdata.kurir[resultOngkir[index - 1]].harga = Number(
            item.replace("Rp.", "")
          );
        }
      }
    });
    return {
      status: "success",
      data: {
        ...JSONdata,
        kurir: Object.keys(JSONdata.kurir).map((item) => JSONdata.kurir[item]),
      },
    };
  } else {
    const resultData = $("div[class='alert alert-danger']")
      .text()
      .replace(/\t/g, "")
      .replace(/\n/g, "");
    return {
      status: "error",
      message: resultData || "something went wrong",
    };
  }
};

exports.GetQueryLocation = async (keyword = "") => {
  const result = await fetch(`https://cek-ongkir.com/search?term=${keyword}`, {
    method: "GET",
    headers: {
      Accept: "application/json, text/javascript, */*; q=0.01",
    },
  });

  const bodyResult = await result.text();
  if (bodyResult === "null") {
    return { status: "success", data: [] };
  } else if (bodyResult === "Subdustrict Tidak Boleh Kosong") {
    return { status: "error", data: bodyResult };
  } else {
    return { status: "success", data: JSON.parse(bodyResult) };
  }
};
