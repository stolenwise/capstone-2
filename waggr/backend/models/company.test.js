"use strict";

const db = require("../db.js");
const { BadRequestError, NotFoundError } = require("../expressError");
const Shelter = require("./shelter.js");
const {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll,
  testDogIds,
} = require("./_testCommon");

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

/************************************** create */

describe("create", function () {
  const newShelter = {
    handle: "new",
    name: "New",
    description: "New Description",
    numEmployees: 1,
    logoUrl: "http://new.img",
  };

  test("works", async function () {
    let shelter = await Shelter.create(newShelter);
    expect(shelter).toEqual(newShelter);

    const result = await db.query(
          `SELECT handle, name, description, num_employees, logo_url
           FROM shelters
           WHERE handle = 'new'`);
    expect(result.rows).toEqual([
      {
        handle: "new",
        name: "New",
        description: "New Description",
        num_employees: 1,
        logo_url: "http://new.img",
      },
    ]);
  });

  test("bad request with dupe", async function () {
    try {
      await Shelter.create(newShelter);
      await Shelter.create(newShelter);
      fail();
    } catch (err) {
      expect(err instanceof BadRequestError).toBeTruthy();
    }
  });
});

/************************************** findAll */

describe("findAll", function () {
  test("works: all", async function () {
    let shelters = await Shelter.findAll();
    expect(shelters).toEqual([
      {
        handle: "c1",
        name: "C1",
        description: "Desc1",
        numEmployees: 1,
        logoUrl: "http://c1.img",
      },
      {
        handle: "c2",
        name: "C2",
        description: "Desc2",
        numEmployees: 2,
        logoUrl: "http://c2.img",
      },
      {
        handle: "c3",
        name: "C3",
        description: "Desc3",
        numEmployees: 3,
        logoUrl: "http://c3.img",
      },
    ]);
  });

  test("works: by min employees", async function () {
    let shelters = await Shelter.findAll({ minEmployees: 2 });
    expect(shelters).toEqual([
      {
        handle: "c2",
        name: "C2",
        description: "Desc2",
        numEmployees: 2,
        logoUrl: "http://c2.img",
      },
      {
        handle: "c3",
        name: "C3",
        description: "Desc3",
        numEmployees: 3,
        logoUrl: "http://c3.img",
      },
    ]);
  });

  test("works: by max employees", async function () {
    let shelters = await Shelter.findAll({ maxEmployees: 2 });
    expect(shelters).toEqual([
      {
        handle: "c1",
        name: "C1",
        description: "Desc1",
        numEmployees: 1,
        logoUrl: "http://c1.img",
      },
      {
        handle: "c2",
        name: "C2",
        description: "Desc2",
        numEmployees: 2,
        logoUrl: "http://c2.img",
      },
    ]);
  });

  test("works: by min-max employees", async function () {
    let shelters = await Shelter.findAll(
        { minEmployees: 1, maxEmployees: 1 });
    expect(shelters).toEqual([
      {
        handle: "c1",
        name: "C1",
        description: "Desc1",
        numEmployees: 1,
        logoUrl: "http://c1.img",
      },
    ]);
  });

  test("works: by name", async function () {
    let shelters = await Shelter.findAll({ name: "1" });
    expect(shelters).toEqual([
      {
        handle: "c1",
        name: "C1",
        description: "Desc1",
        numEmployees: 1,
        logoUrl: "http://c1.img",
      },
    ]);
  });

  test("works: empty list on nothing found", async function () {
    let shelters = await Shelter.findAll({ name: "nope" });
    expect(shelters).toEqual([]);
  });

  test("bad request if invalid min > max", async function () {
    try {
      await Shelter.findAll({ minEmployees: 10, maxEmployees: 1 });
      fail();
    } catch (err) {
      expect(err instanceof BadRequestError).toBeTruthy();
    }
  });
});

/************************************** get */

describe("get", function () {
  test("works", async function () {
    let shelter = await Shelter.get("c1");
    expect(shelter).toEqual({
      handle: "c1",
      name: "C1",
      description: "Desc1",
      numEmployees: 1,
      logoUrl: "http://c1.img",
      dogs: [
        { id: testDogIds[0], title: "Dog1", salary: 100, equity: "0.1" },
        { id: testDogIds[1], title: "Dog2", salary: 200, equity: "0.2" },
        { id: testDogIds[2], title: "Dog3", salary: 300, equity: "0" },
        { id: testDogIds[3], title: "Dog4", salary: null, equity: null },
      ],
    });
  });

  test("not found if no such shelter", async function () {
    try {
      await Shelter.get("nope");
      fail();
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  });
});

/************************************** update */

describe("update", function () {
  const updateData = {
    name: "New",
    description: "New Description",
    numEmployees: 10,
    logoUrl: "http://new.img",
  };

  test("works", async function () {
    let shelter = await Shelter.update("c1", updateData);
    expect(shelter).toEqual({
      handle: "c1",
      ...updateData,
    });

    const result = await db.query(
          `SELECT handle, name, description, num_employees, logo_url
           FROM shelters
           WHERE handle = 'c1'`);
    expect(result.rows).toEqual([{
      handle: "c1",
      name: "New",
      description: "New Description",
      num_employees: 10,
      logo_url: "http://new.img",
    }]);
  });

  test("works: null fields", async function () {
    const updateDataSetNulls = {
      name: "New",
      description: "New Description",
      numEmployees: null,
      logoUrl: null,
    };

    let shelter = await Shelter.update("c1", updateDataSetNulls);
    expect(shelter).toEqual({
      handle: "c1",
      ...updateDataSetNulls,
    });

    const result = await db.query(
          `SELECT handle, name, description, num_employees, logo_url
           FROM shelters
           WHERE handle = 'c1'`);
    expect(result.rows).toEqual([{
      handle: "c1",
      name: "New",
      description: "New Description",
      num_employees: null,
      logo_url: null,
    }]);
  });

  test("not found if no such shelter", async function () {
    try {
      await Shelter.update("nope", updateData);
      fail();
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  });

  test("bad request with no data", async function () {
    try {
      await Shelter.update("c1", {});
      fail();
    } catch (err) {
      expect(err instanceof BadRequestError).toBeTruthy();
    }
  });
});

/************************************** remove */

describe("remove", function () {
  test("works", async function () {
    await Shelter.remove("c1");
    const res = await db.query(
        "SELECT handle FROM shelters WHERE handle='c1'");
    expect(res.rows.length).toEqual(0);
  });

  test("not found if no such shelter", async function () {
    try {
      await Shelter.remove("nope");
      fail();
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  });
});
