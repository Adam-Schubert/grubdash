const path = require("path");
// Use the existing order and dishes data
const orders = require(path.resolve("src/data/orders-data"));
const dishes = require(path.resolve("src/data/dishes-data"));
// Use this function to assigh ID's when necessary
const nextId = require("../utils/nextId");

// TODO: Implement the /orders handlers needed to make the tests pass

const create = (req, res) => {
  const { data: { deliverTo, mobileNumber, status, dishes } = {} } = req.body;
  const newOrder = {
    id: nextId(),
    deliverTo,
    mobileNumber,
    status,
    dishes: dishes,
  };

  orders.push(newOrder);

  res.status(201).json({ data: newOrder });
};

const list = (req, res, _next) => {
  res.json({ data: orders });
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

const validateOrderExists = (req, res, next) => {
  const { orderId } = req.params;
  const orderIndex = orders.findIndex((order) => order.id === orderId);

  if (orderIndex < 0) {
    const message = `Order with id ${orderId} not found.`;
    return next({ status: 404, message });
  } else {
    res.locals.orderIndex = orderIndex;
    res.locals.order = orders[orderIndex];
    next();
  }
};

function orderHasDeliverTo(req, res, next) {
    const { data: { deliverTo } = {} } = req.body;
    if (deliverTo && deliverTo !== "") {
        return next();
    }
    next({
        status: 400,
        message: "Order must include a deliverTo"
    });
}

function orderHasMobileNumber(req, res, next) {
    const { data: { mobileNumber } = {} } = req.body;
    if (mobileNumber && mobileNumber !== "") {
        return next();
    }
    next({
        status: 400,
        message: "Order must include a mobileNumber"
    });
}

function orderHasStatus(req, res, next) {
    const { data: { status } = {} } = req.body;
    if (status && status !== "" && status !=="invalid") {
        return next();
    }
    next({
        status: 400,
        message: "Order must include a status"
    });
}

function orderHasADish(req, res, next) {
    const { data: { dishes } = {} } = req.body;
    if(dishes && dishes !== []) {
        return next();
    }
    next({
        status: 400,
        message: "Order must include a dish"
    });
}

function orderHasDishQuantity(req, res, next) {
  const { data: { dishes } = {} } = req.body;
  if(!Array.isArray(dishes) || dishes.length === 0) {
      return next({
        status:400,
        message:'Order must include at least one dish'
      });
    }
  const indexesOfDishesWithoutQuantityProperty = dishes.reduce((acc, dish, index) => {
    if (
      !dish.quantity ||
      !dish.quantity > 0 ||
      typeof dish.quantity !== "number"
) {
  acc.push(index);
  return acc;
}
  return acc;
},[]);
  if (!indexesOfDishesWithoutQuantityProperty.length) {
    return next();
  }
  next({
    status: 400, message: `Dish ${indexesOfDishesWithoutQuantityProperty} must have a quantity that is an integer greater than 0`
  });
}

function orderHasValidId(req, res, next) {
  const { data:{id}={} } = req.body;
  const {orderId} = req.params;
  if(id && id !== orderId) {
      return next({
        status:400,
        message:`Order id does not match route id. Order: ${id}, Route: ${orderId}`
    });
  }
  next();
}

const read = (req, res, next) => {
  const { order } = res.locals;
  res.json({ data: order });
};

const update = (req, res) => {
  const { deliverTo, mobileNumber, status, dishes } = req.body.data;

  const updatedOrder = {
    ...res.locals.order,
    deliverTo,
    mobileNumber,
    status,
    dishes,
  };
  res.json({ data: updatedOrder });
};

function checkOrderStatus(req, res, next) {
  const {order} = res.locals;
  if(order.status !== "pending") {
      next({
        status: 400, message: `An order cannot be deleted unless it is pending.`
    });
  }
  next();
}

function destroy(req, res) {
    const { orderId } = req.params;
    const index = orders.findIndex((order) => order.id === Number(orderId));
    const deletedOrders = orders.splice(index, 1);
    res.sendStatus(204);
  }

module.exports = {
  create: [orderHasDeliverTo, orderHasMobileNumber, orderHasADish, orderHasDishQuantity, create],
  list,
  read: [validateOrderExists, read],
  update: [validateOrderExists, validateDataExists, orderHasValidId, orderHasDeliverTo, orderHasMobileNumber, orderHasStatus, orderHasADish, orderHasDishQuantity, update],
  delete: [validateOrderExists, checkOrderStatus, destroy],
};

