const path = require("path");

// Use the existing dishes data
const dishes = require(path.resolve("src/data/dishes-data"));

// Use this function to assign ID's when necessary
const nextId = require("../utils/nextId");

// TODO: Implement the /dishes handlers needed to make the tests pass

const create = (req, res) => {
  const { data: { name, description, price, image_url } = {} } = req.body;
  const newDish = {
    id: nextId(),
    name,
    description,
    price,
    image_url,
  };

  dishes.push(newDish);

  res.status(201).json({ data: newDish });
};

const list = (req, res, _next) => {
  res.json({ data: dishes });
};

const validateDataExists = (req, res, next) => {
  const data = req.body.data;
  if (data) {
    next();
  } else {
    next({
      status: 400,
      message: `request must include data.`,
    });
  }
};

const validateDishExists = (req, res, next) => {
  const { dishId } = req.params;
  const dishIndex = dishes.findIndex((dish) => dish.id === dishId);

  if (dishIndex < 0) {
    const message = `Dish with id ${dishId} not found.`;
    return next({ status: 404, message });
  } else {
    res.locals.dishIndex = dishIndex;
    res.locals.dish = dishes[dishIndex];
    next();
  }
};

function dishHasName(req, res, next) {
    const { data: { name } = {} } = req.body;
    if (name && name !== "") {
        return next();
    }
    next({
        status: 400,
        message: "Dish must include a name"
    });
}

function dishHasDescription(req, res, next) {
    const { data: { description } = {} } = req.body;
    if (description) {
        return next();
    }
    next({
        status: 400,
        message: "Dish must include a description"
    });
}

function dishHasImageUrl(req, res, next) {
    const { data: { image_url } = {} } = req.body;
    if(image_url && image_url !== "") {
        return next();
    }
    next({
        status: 400,
        message: "Dish must include a image_url"
    });
}

function dishHasValidPrice(req, res, next) {
  const { data: { price } = {} } = req.body;
  if (typeof price === "string" || price instanceof String) {
    return next({
      status: 400,
      message: "Dish must have a price that is an integer greater than 0",
    });
  }
  if (price && price > 0) {
    return next();
  }
  if (!price) {
    return next({
      status: 400,
      message: "Dish must include a price",
    });
  }
  if (price <= 0) {
    return next({
      status: 400,
      message: "Dish must have a price that is an integer greater than 0",
    });
  }
}


function dishHasValidId(req, res, next) {
  const { data:{id}={} } = req.body;
  const {dishId} = req.params;
  if(id && id !== dishId) {
      return next({
        status:400,
        message:`Dish id does not match route id. Dish: ${id}, Route: ${dishId}`
    });
  }
  next();
}

const read = (req, res, next) => {
  const { dish } = res.locals;
  res.json({ data: dish });
};

const update = (req, res) => {
  const { name, description, price, image_url } = req.body.data;

  const updatedDish = {
    ...res.locals.dish,
    name,
    description,
    price,
    image_url,
  };
  res.json({ data: updatedDish });
};

module.exports = {
  create: [validateDataExists, dishHasName, dishHasDescription, dishHasImageUrl, dishHasValidPrice, create],
  list,
  read: [validateDishExists, read],
  update: [validateDishExists, validateDataExists, dishHasValidId, dishHasName, dishHasDescription, dishHasImageUrl, dishHasValidPrice, update],
};
