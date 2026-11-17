const http = require("http");
const fs = require("fs");
const path = require("path");

const PORT = 3000;

let foods = [
  { id: 1, foodName: "Pizza", category: "Fast Food", price: 250, availability: true },
  { id: 2, foodName: "Burger", category: "Fast Food", price: 120, availability: true },
  { id: 3, foodName: "Pasta", category: "Italian", price: 180, availability: false }
];

function sendJson(res, statusCode, data) {
  res.writeHead(statusCode, { "Content-Type": "application/json; charset=utf-8" });
  res.end(JSON.stringify(data));
}

function isValidFood(food) {
  return food &&
    Number.isInteger(Number(food.id)) &&
    typeof food.foodName === "string" && food.foodName.trim() !== "" &&
    typeof food.category === "string" && food.category.trim() !== "" &&
    typeof food.price === "number" && Number.isFinite(food.price) && food.price > 0 &&
    typeof food.availability === "boolean";
}

const server = http.createServer((req, res) => {
  const { method, url } = req;

  if (method === "GET" && url === "/") {
    res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
    return res.end("<h1>Welcome to Foodie's Restaurant</h1><p>Fresh and delicious food!</p>");
  }

  if (method === "GET" && url === "/foods") {
    return sendJson(res, 200, foods.filter(food => food.availability === true));
  }

  if (method === "GET" && url === "/about") {
    return sendJson(res, 200, {
      restaurant: "Foodie's Restaurant",
      message: "We serve fresh, tasty and hygienic food."
    });
  }

  if (method === "GET" && url === "/menu") {
    const menuPath = path.join(__dirname, "public", "menu.html");
    return fs.readFile(menuPath, "utf8", (error, data) => {
      if (error) {
        return sendJson(res, 500, { message: "Unable to read menu file." });
      }
      res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
      res.end(data);
    });
  }

  if (method === "POST" && url === "/add-food") {
    let body = "";
    req.on("data", chunk => { body += chunk; });

    req.on("end", () => {
      let newFood;
      try {
        newFood = JSON.parse(body);
      } catch (error) {
        return sendJson(res, 400, { message: "Invalid JSON." });
      }

      if (!isValidFood(newFood)) {
        return sendJson(res, 400, {
          message: "Required fields: id (integer), foodName, category, positive numeric price, availability (boolean)."
        });
      }

      if (foods.some(food => food.id === Number(newFood.id))) {
        return sendJson(res, 400, { message: "Food ID already exists." });
      }

      newFood.id = Number(newFood.id);
      foods.push(newFood);
      return sendJson(res, 201, { message: "Food item added successfully.", food: newFood });
    });
    return;
  }

  return sendJson(res, 404, { message: "Route not found." });
});

server.listen(PORT, () => {
  console.log(`HTTP server running at http://localhost:${PORT}`);
});
