# Coupons Management System

## Introduction

The Coupons Management System is a backend application designed to provide businesses with a comprehensive solution to manage and apply discount coupons effectively. The system caters to various coupon types, including cart-wise, product-wise, and buy-X-get-Y (BxGy) coupons, enabling flexible discounting mechanisms tailored to diverse promotional strategies.

This application is built with Express.js and MongoDB to ensure scalability, reliability, and ease of use. It employs a modular architecture for clean separation of concerns, making it easy to extend and maintain. The coupon system is highly configurable, allowing businesses to define specific discount rules, thresholds, repetition limits, and applicability conditions.

## Project Setup

### Prerequisites
- [Node.js](https://nodejs.org/) (v18 or above)
- [MongoDB](https://www.mongodb.com/) (local or cloud-based)
- [Git](https://git-scm.com/) (optional, for cloning the repository)

## Installation

### Clone the repository:

```
git clone https://github.com/AnujKV123/coupons-management-system.git
cd coupons-management-system
```

### Install Dependencies

```
npm install
```

### Environment Setup

Configure environment variables: Create a .env file in the root directory with the following.

```
API_PORT=4200
MONGO_URI=your_mongodb_connection_string
DB_NAME=your_db_name
```

### Run the application in local env:

To start the application in your local environment, run the following command in the root directory:

```
npm run dev
```

This command will start the Node.js server and connect to the MongoDB instance using the connection string provided in the .env file.


### Run the application in production env:

To start the application in production environment, run the following command in the root directory:

```
npm start
```

## Postman Collection

[Publicly accessible link](https://documenter.getpostman.com/view/12227404/2sAYBPmEGw) of a Postman Collection for testing the APIs.

## Implemented Cases

### 1. Cart-Wise Coupons

- **Description**: Applies a percentage discount to the entire cart if the total price exceeds a specified threshold.

- **Example:**
    - Coupon: `10% off on carts over Rs. 100`
    - Cart Total: `Rs. 200`
    - Discount Applied: `Rs. 20`

### 2. Product-Wise Coupons

- **Description**: Applies a percentage discount to a specific product in the cart.

- **Example:**
    - Coupon: `20% off on Product A`
    - Cart Contains: `Product A` (Price: Rs. 50, Quantity: 3)
    - Discount Applied: `Rs. 30 (20% of Rs. 150)`

### 3. Buy-X-Get-Y Coupons (BxGy)

- **Description**: Allows customers to get free products after meeting a "buy" condition.

- **Example:**
    - Coupon: `Buy 2 products from [X, Y, Z], Get 1 product from [A, B, C] for free`
    - Cart:
        - 6 items from `[X, Y, Z]`
        - 3 items from `[A, B, C]`
    - Free Products: `3 items (from [A, B, C])`
- Repetition Limit: Ensures the coupon can be applied multiple times but is capped by a maximum repetition limit.


## Unimplemented Cases

1. **Combination of Multiple Coupons:**
    - **Reason**: Current logic handles one coupon per transaction for simplicity. Managing multiple coupons requires prioritization and potential conflicts handling, which wasn't scoped.

2. **Dynamic Coupon Logic:**
    -  **Reason**: Coupons with dynamic conditions (e.g., day-based discounts) require additional fields and logic in the schema, which are outside the current scope.


## Limitations

1. **Single Coupon Per Request:**
    - Only one coupon can be applied to a cart at a time.
2. **Dependency on Predefined Coupon Types:**
    -  Adding new coupon types would require schema and logic updates.

## Assumptions

1. **Product Matching:**
    - Product IDs in the cart and coupons match directly (no variations or aliases).
2. **Free Product Pricing:**
    -  Free products under BxGy coupons have a `0` price and add no cost to the cart.
2. **Product Matching::**
    -  Product IDs in the cart and coupons match directly (no variations or aliases)..


## Future Enhancements

1. **Multi-Coupon Application:**
    - Add support for stacking coupons with rules for prioritization and conflicts.
2. **Product Database Integration:**
    -  Integrate with a product database to validate product details dynamically.
3. **Advanced Filtering:**
    -  Add filters like user-specific coupons, time-limited coupons, etc.
2. **Performance Optimizations:**
    -  Optimize query and aggregation pipelines for high traffic and large datasets.


