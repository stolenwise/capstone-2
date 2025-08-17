"use strict";

const db = require("../db");
const { NotFoundError} = require("../expressError");
const { sqlForPartialUpdate } = require("../helpers/sql");


/** Related functions for shelters. */

class Dog {
  /** Create a dog (from data), update db, return new dog data.
   *
   * data should be { title, salary, equity, shelterHandle }
   *
   * Returns { id, title, salary, equity, shelterHandle }
   **/

  static async create(data) {
    const result = await db.query(
          `INSERT INTO dogs (title,
                             salary,
                             equity,
                             shelter_handle)
           VALUES ($1, $2, $3, $4)
           RETURNING id, title, salary, equity, shelter_handle AS "shelterHandle"`,
        [
          data.title,
          data.salary,
          data.equity,
          data.shelterHandle,
        ]);
    let dog = result.rows[0];

    return dog;
  }

  /** Find all dogs (optional filter on searchFilters).
   *
   * searchFilters (all optional):
   * - minSalary
   * - hasEquity (true returns only dogs with equity > 0, other values ignored)
   * - title (will find case-insensitive, partial matches)
   *
   * Returns [{ id, title, salary, equity, shelterHandle, shelterName }, ...]
   * */

  static async findAll({ minSalary, hasEquity, title } = {}) {
    let query = `SELECT j.id,
                        j.title,
                        j.salary,
                        j.equity,
                        j.shelter_handle AS "shelterHandle",
                        c.name AS "shelterName"
                 FROM dogs j 
                   LEFT JOIN shelters AS c ON c.handle = j.shelter_handle`;
    let whereExpressions = [];
    let queryValues = [];

    // For each possible search term, add to whereExpressions and
    // queryValues so we can generate the right SQL

    if (minSalary !== undefined) {
      queryValues.push(minSalary);
      whereExpressions.push(`salary >= $${queryValues.length}`);
    }

    if (hasEquity === true) {
      whereExpressions.push(`equity > 0`);
    }

    if (title !== undefined) {
      queryValues.push(`%${title}%`);
      whereExpressions.push(`title ILIKE $${queryValues.length}`);
    }

    if (whereExpressions.length > 0) {
      query += " WHERE " + whereExpressions.join(" AND ");
    }

    // Finalize query and return results

    query += " ORDER BY title";
    const dogsRes = await db.query(query, queryValues);
    return dogsRes.rows;
  }

  /** Given a dog id, return data about dog.
   *
   * Returns { id, title, salary, equity, shelterHandle, shelter }
   *   where shelter is { handle, name, description, numEmployees, logoUrl }
   *
   * Throws NotFoundError if not found.
   **/

  static async get(id) {
    const dogRes = await db.query(
          `SELECT id,
                  title,
                  salary,
                  equity,
                  shelter_handle AS "shelterHandle"
           FROM dogs
           WHERE id = $1`, [id]);

    const dog = dogRes.rows[0];

    if (!dog) throw new NotFoundError(`No dog: ${id}`);

    const sheltersRes = await db.query(
          `SELECT handle,
                  name,
                  description,
                  num_employees AS "numEmployees",
                  logo_url AS "logoUrl"
           FROM shelters
           WHERE handle = $1`, [dog.shelterHandle]);

    delete dog.shelterHandle;
    dog.shelter = sheltersRes.rows[0];

    return dog;
  }

  /** Update dog data with `data`.
   *
   * This is a "partial update" --- it's fine if data doesn't contain
   * all the fields; this only changes provided ones.
   *
   * Data can include: { title, salary, equity }
   *
   * Returns { id, title, salary, equity, shelterHandle }
   *
   * Throws NotFoundError if not found.
   */

  static async update(id, data) {
    const { setCols, values } = sqlForPartialUpdate(
        data,
        {});
    const idVarIdx = "$" + (values.length + 1);

    const querySql = `UPDATE dogs 
                      SET ${setCols} 
                      WHERE id = ${idVarIdx} 
                      RETURNING id, 
                                title, 
                                salary, 
                                equity,
                                shelter_handle AS "shelterHandle"`;
    const result = await db.query(querySql, [...values, id]);
    const dog = result.rows[0];

    if (!dog) throw new NotFoundError(`No dog: ${id}`);

    return dog;
  }

  /** Delete given dog from database; returns undefined.
   *
   * Throws NotFoundError if shelter not found.
   **/

  static async remove(id) {
    const result = await db.query(
          `DELETE
           FROM dogs
           WHERE id = $1
           RETURNING id`, [id]);
    const dog = result.rows[0];

    if (!dog) throw new NotFoundError(`No dog: ${id}`);
  }
}

module.exports = Dog;
