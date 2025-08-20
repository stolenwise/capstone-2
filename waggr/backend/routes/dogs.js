"use strict";

/** Routes for dogs. */

const jsonschema = require("jsonschema");

const express = require("express");
const { BadRequestError } = require("../expressError");
const { ensureAdmin } = require("../middleware/auth");
const Dog = require("../models/dog");
const dogNewSchema = require("../schemas/dogNew.json");
const dogUpdateSchema = require("../schemas/dogUpdate.json");
const dogSearchSchema = require("../schemas/dogSearch.json");

const router = express.Router({ mergeParams: true });


/** POST / { dog } => { dog }
 *
 * dog should be { title, salary, equity, shelterHandle }
 *
 * Returns { id, title, salary, equity, shelterHandle }
 *
 * Authorization required: admin
 */

router.post("/", ensureAdmin, async function (req, res, next) {
  try {
    const validator = jsonschema.validate(req.body, dogNewSchema);
    if (!validator.valid) {
      const errs = validator.errors.map(e => e.stack);
      throw new BadRequestError(errs);
    }

    const dog = await Dog.create(req.body);
    return res.status(201).json({ dog });
  } catch (err) {
    return next(err);
  }
});

/** GET / =>
 *   { dogs: [ { id, title, salary, equity, shelterHandle, shelterName }, ...] }
 *
 * Can provide search filter in query:
 * - minSalary
 * - hasEquity (true returns only dogs with equity > 0, other values ignored)
 * - title (will find case-insensitive, partial matches)

 * Authorization required: none
 */

  router.get("/", async function (req, res, next) {
    // Accept filters you support; ignore the old Jobly ones.
    const q = {
      name: req.query.name,
      breed: req.query.breed,
      minAge: req.query.minAge !== undefined ? +req.query.minAge : undefined,
      maxAge: req.query.maxAge !== undefined ? +req.query.maxAge : undefined,
    };
  
    try {
      // (Temporarily) skip Jobly search schema or replace it with a dogSearch schema that matches q.
      // const validator = jsonschema.validate(q, dogSearchSchema);
      // if (!validator.valid) throw new BadRequestError(validator.errors.map(e => e.stack));
  
      const dogs = await Dog.findAll(q);
      return res.json({ dogs });
    } catch (err) {
      return next(err);
    }
  });
  

/** GET /[dogId] => { dog }
 *
 * Returns { id, title, salary, equity, shelter }
 *   where shelter is { handle, name, description, numEmployees, logoUrl }
 *
 * Authorization required: none
 */

router.get("/:id", async function (req, res, next) {
  try {
    const dog = await Dog.get(req.params.id);
    return res.json({ dog });
  } catch (err) {
    return next(err);
  }
});


/** PATCH /[dogId]  { fld1, fld2, ... } => { dog }
 *
 * Data can include: { title, salary, equity }
 *
 * Returns { id, title, salary, equity, shelterHandle }
 *
 * Authorization required: admin
 */

router.patch("/:id", ensureAdmin, async function (req, res, next) {
  try {
    const validator = jsonschema.validate(req.body, dogUpdateSchema);
    if (!validator.valid) {
      const errs = validator.errors.map(e => e.stack);
      throw new BadRequestError(errs);
    }

    const dog = await Dog.update(req.params.id, req.body);
    return res.json({ dog });
  } catch (err) {
    return next(err);
  }
});

/** DELETE /[handle]  =>  { deleted: id }
 *
 * Authorization required: admin
 */

router.delete("/:id", ensureAdmin, async function (req, res, next) {
  try {
    await Dog.remove(req.params.id);
    return res.json({ deleted: +req.params.id });
  } catch (err) {
    return next(err);
  }
});


module.exports = router;
