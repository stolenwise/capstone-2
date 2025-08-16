"use strict";

/** Routes for dogs. */

const jsonschema = require("jsonschema");

const express = require("express");
const { BadRequestError } = require("../expressError");
const { ensureAdmin } = require("../middleware/auth");
const Job = require("../models/dog");
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

    const dog = await Job.create(req.body);
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
  const q = req.query;
  // arrive as strings from querystring, but we want as int/bool
  if (q.minSalary !== undefined) q.minSalary = +q.minSalary;
  q.hasEquity = q.hasEquity === "true";

  try {
    const validator = jsonschema.validate(q, dogSearchSchema);
    if (!validator.valid) {
      const errs = validator.errors.map(e => e.stack);
      throw new BadRequestError(errs);
    }

    const dogs = await Job.findAll(q);
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
    const dog = await Job.get(req.params.id);
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

    const dog = await Job.update(req.params.id, req.body);
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
    await Job.remove(req.params.id);
    return res.json({ deleted: +req.params.id });
  } catch (err) {
    return next(err);
  }
});


module.exports = router;
