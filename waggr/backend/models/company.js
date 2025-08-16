"use strict";

const db = require("../db");
const { BadRequestError, NotFoundError } = require("../expressError");
const { sqlForPartialUpdate } = require("../helpers/sql");

/** Related functions for shelters. */

class Company {
  /** Create a shelter (from data), update db, return new shelter data.
   *
   * data should be { handle, name, description, numEmployees, logoUrl }
   *
   * Returns { handle, name, description, numEmployees, logoUrl }
   *
   * Throws BadRequestError if shelter already in database.
   * */

  static async create({ handle, name, description, numEmployees, logoUrl }) {
    const duplicateCheck = await db.query(
          `SELECT handle
           FROM shelters
           WHERE handle = $1`,
        [handle]);

    if (duplicateCheck.rows[0])
      throw new BadRequestError(`Duplicate shelter: ${handle}`);

    const result = await db.query(
          `INSERT INTO shelters
           (handle, name, description, num_employees, logo_url)
           VALUES ($1, $2, $3, $4, $5)
           RETURNING handle, name, description, num_employees AS "numEmployees", logo_url AS "logoUrl"`,
        [
          handle,
          name,
          description,
          numEmployees,
          logoUrl,
        ],
    );
    const shelter = result.rows[0];

    return shelter;
  }

  /** Find all shelters (optional filter on searchFilters).
   *
   * searchFilters (all optional):
   * - minEmployees
   * - maxEmployees
   * - name (will find case-insensitive, partial matches)
   *
   * Returns [{ handle, name, description, numEmployees, logoUrl }, ...]
   * */

  static async findAll(searchFilters = {}) {
    let query = `SELECT handle,
                        name,
                        description,
                        num_employees AS "numEmployees",
                        logo_url AS "logoUrl"
                 FROM shelters`;
    let whereExpressions = [];
    let queryValues = [];

    const { minEmployees, maxEmployees, name } = searchFilters;

    if (minEmployees > maxEmployees) {
      throw new BadRequestError("Min employees cannot be greater than max");
    }

    // For each possible search term, add to whereExpressions and queryValues so
    // we can generate the right SQL

    if (minEmployees !== undefined) {
      queryValues.push(minEmployees);
      whereExpressions.push(`num_employees >= $${queryValues.length}`);
    }

    if (maxEmployees !== undefined) {
      queryValues.push(maxEmployees);
      whereExpressions.push(`num_employees <= $${queryValues.length}`);
    }

    if (name) {
      queryValues.push(`%${name}%`);
      whereExpressions.push(`name ILIKE $${queryValues.length}`);
    }

    if (whereExpressions.length > 0) {
      query += " WHERE " + whereExpressions.join(" AND ");
    }

    // Finalize query and return results

    query += " ORDER BY name";
    const sheltersRes = await db.query(query, queryValues);
    return sheltersRes.rows;
  }

  /** Given a shelter handle, return data about shelter.
   *
   * Returns { handle, name, description, numEmployees, logoUrl, dogs }
   *   where dogs is [{ id, title, salary, equity }, ...]
   *
   * Throws NotFoundError if not found.
   **/

  static async get(handle) {
    const shelterRes = await db.query(
          `SELECT handle,
                  name,
                  description,
                  num_employees AS "numEmployees",
                  logo_url AS "logoUrl"
           FROM shelters
           WHERE handle = $1`,
        [handle]);

    const shelter = shelterRes.rows[0];

    if (!shelter) throw new NotFoundError(`No shelter: ${handle}`);

    const dogsRes = await db.query(
          `SELECT id, title, salary, equity
           FROM dogs
           WHERE shelter_handle = $1
           ORDER BY id`,
        [handle],
    );

    shelter.dogs = dogsRes.rows;

    return shelter;
  }

  /** Update shelter data with `data`.
   *
   * This is a "partial update" --- it's fine if data doesn't contain all the
   * fields; this only changes provided ones.
   *
   * Data can include: {name, description, numEmployees, logoUrl}
   *
   * Returns {handle, name, description, numEmployees, logoUrl}
   *
   * Throws NotFoundError if not found.
   */

  static async update(handle, data) {
    const { setCols, values } = sqlForPartialUpdate(
        data,
        {
          numEmployees: "num_employees",
          logoUrl: "logo_url",
        });
    const handleVarIdx = "$" + (values.length + 1);

    const querySql = `UPDATE shelters 
                      SET ${setCols} 
                      WHERE handle = ${handleVarIdx} 
                      RETURNING handle, 
                                name, 
                                description, 
                                num_employees AS "numEmployees", 
                                logo_url AS "logoUrl"`;
    const result = await db.query(querySql, [...values, handle]);
    const shelter = result.rows[0];

    if (!shelter) throw new NotFoundError(`No shelter: ${handle}`);

    return shelter;
  }

  /** Delete given shelter from database; returns undefined.
   *
   * Throws NotFoundError if shelter not found.
   **/

  static async remove(handle) {
    const result = await db.query(
          `DELETE
           FROM shelters
           WHERE handle = $1
           RETURNING handle`,
        [handle]);
    const shelter = result.rows[0];

    if (!shelter) throw new NotFoundError(`No shelter: ${handle}`);
  }
}


module.exports = Company;
