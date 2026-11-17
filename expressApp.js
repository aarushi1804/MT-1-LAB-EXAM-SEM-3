const express = require("express");

const app = express();
const PORT = 4000;

app.use(express.json());

let foods = [
  { id: 1, foodName: "Pizza", category: "Fast Food", price: 250, availability: true },
  { id: 2, foodName: "Burger", category: "Fast Food", price: 120, availability: true },
  { id: 3, foodName: "Pasta", category: "Italian", price: 180, availability: false }
];

function validFood(food) {
  return food &&
    typeof food.foodName === "string" && food.foodName.trim() !== "" &&
    typeof food.category === "string" && food.category.trim() !== "" &&
    typeof food.price === "number" && Number.isFinite(food.price) && food.price > 0 &&
    typeof food.availability === "boolean";
}

// GET: Retrieve all food items
app.get("/foods", (req, res) => {
  res.status(200).json(foods);
});

// GET: Retrieve one food item by ID
app.get("/foods/:id", (req, res) => {
  const id = Number(req.params.id);
  const food = foods.find(item => item.id === id);

  if (!Number.isInteger(id) || !food) {
    return res.status(404).json({ message: "Food item not found." });
  }

  res.status(200).json(food);
});

// POST: Add a new food item
app.post("/foods", (req, res) => {
  const { foodName, category, price, availability } = req.body;

  if (!validFood({ foodName, category, price, availability })) {
    return res.status(400).json({
      message: "Provide foodName, category, positive numeric price and boolean availability."
    });
  }

  const newId = foods.length ? Math.max(...foods.map(item => item.id)) + 1 : 1;
  const newFood = { id: newId, foodName: foodName.trim(), category: category.trim(), price, availability };

  foods.push(newFood);
  res.status(201).json({ message: "Food item created successfully.", food: newFood });
});

// PUT: Update a food item by ID
app.put("/foods/:id", (req, res) => {
  const id = Number(req.params.id);
  const index = foods.findIndex(item => item.id === id);

  if (!Number.isInteger(id) || index === -1) {
    return res.status(404).json({ message: "Food item not found." });
  }

  const { foodName, category, price, availability } = req.body;
  if (!validFood({ foodName, category, price, availability })) {
    return res.status(400).json({
      message: "Provide all fields: foodName, category, positive numeric price and boolean availability."
    });
  }

  foods[index] = { id, foodName: foodName.trim(), category: category.trim(), price, availability };
  res.status(200).json({ message: "Food item updated successfully.", food: foods[index] });
});

// DELETE: Delete a food item by ID
app.delete("/foods/:id", (req, res) => {
  const id = Number(req.params.id);
  const index = foods.findIndex(item => item.id === id);

  if (!Number.isInteger(id) || index === -1) {
    return res.status(404).json({ message: "Food item not found." });
  }

  const deletedFood = foods.splice(index, 1)[0];
  res.status(200).json({ message: "Food item deleted successfully.", food: deletedFood });
});

// Invalid JSON sent to express.json()
app.use((err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400 && "body" in err) {
    return res.status(400).json({ message: "Invalid JSON." });
  }
  next(err);
});

// Invalid route
app.use((req, res) => {
  res.status(404).json({ message: "Route not found." });
});

app.listen(PORT, () => {
  console.log(`Express server running at http://localhost:${PORT}`);
});
