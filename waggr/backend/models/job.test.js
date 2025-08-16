"use strict";

const { NotFoundError, BadRequestError } = require("../expressError");
const db = require("../db.js");
const Job = require("./dog.js");
const {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll,
  testJobIds,
} = require("./_testCommon");

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

/************************************** create */

describe("create", function () {
  let newJob = {
    shelterHandle: "c1",
    title: "Test",
    salary: 100,
    equity: "0.1",
  };

  test("works", async function () {
    let dog = await Job.create(newJob);
    expect(dog).toEqual({
      ...newJob,
      id: expect.any(Number),
    });
  });
});

/************************************** findAll */

describe("findAll", function () {
  test("works: no filter", async function () {
    let dogs = await Job.findAll();
    expect(dogs).toEqual([
      {
        id: testJobIds[0],
        title: "Job1",
        salary: 100,
        equity: "0.1",
        shelterHandle: "c1",
        shelterName: "C1",
      },
      {
        id: testJobIds[1],
        title: "Job2",
        salary: 200,
        equity: "0.2",
        shelterHandle: "c1",
        shelterName: "C1",
      },
      {
        id: testJobIds[2],
        title: "Job3",
        salary: 300,
        equity: "0",
        shelterHandle: "c1",
        shelterName: "C1",
      },
      {
        id: testJobIds[3],
        title: "Job4",
        salary: null,
        equity: null,
        shelterHandle: "c1",
        shelterName: "C1",
      },
    ]);
  });

  test("works: by min salary", async function () {
    let dogs = await Job.findAll({ minSalary: 250 });
    expect(dogs).toEqual([
      {
        id: testJobIds[2],
        title: "Job3",
        salary: 300,
        equity: "0",
        shelterHandle: "c1",
        shelterName: "C1",
      },
    ]);
  });

  test("works: by equity", async function () {
    let dogs = await Job.findAll({ hasEquity: true });
    expect(dogs).toEqual([
      {
        id: testJobIds[0],
        title: "Job1",
        salary: 100,
        equity: "0.1",
        shelterHandle: "c1",
        shelterName: "C1",
      },
      {
        id: testJobIds[1],
        title: "Job2",
        salary: 200,
        equity: "0.2",
        shelterHandle: "c1",
        shelterName: "C1",
      },
    ]);
  });

  test("works: by min salary & equity", async function () {
    let dogs = await Job.findAll({ minSalary: 150, hasEquity: true });
    expect(dogs).toEqual([
      {
        id: testJobIds[1],
        title: "Job2",
        salary: 200,
        equity: "0.2",
        shelterHandle: "c1",
        shelterName: "C1",
      },
    ]);
  });

  test("works: by name", async function () {
    let dogs = await Job.findAll({ title: "ob1" });
    expect(dogs).toEqual([
      {
        id: testJobIds[0],
        title: "Job1",
        salary: 100,
        equity: "0.1",
        shelterHandle: "c1",
        shelterName: "C1",
      },
    ]);
  });
});

/************************************** get */

describe("get", function () {
  test("works", async function () {
    let dog = await Job.get(testJobIds[0]);
    expect(dog).toEqual({
      id: testJobIds[0],
      title: "Job1",
      salary: 100,
      equity: "0.1",
      shelter: {
        handle: "c1",
        name: "C1",
        description: "Desc1",
        numEmployees: 1,
        logoUrl: "http://c1.img",
      },
    });
  });

  test("not found if no such dog", async function () {
    try {
      await Job.get(0);
      fail();
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  });
});

/************************************** update */

describe("update", function () {
  let updateData = {
    title: "New",
    salary: 500,
    equity: "0.5",
  };
  test("works", async function () {
    let dog = await Job.update(testJobIds[0], updateData);
    expect(dog).toEqual({
      id: testJobIds[0],
      shelterHandle: "c1",
      ...updateData,
    });
  });

  test("not found if no such dog", async function () {
    try {
      await Job.update(0, {
        title: "test",
      });
      fail();
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  });

  test("bad request with no data", async function () {
    try {
      await Job.update(testJobIds[0], {});
      fail();
    } catch (err) {
      expect(err instanceof BadRequestError).toBeTruthy();
    }
  });
});

/************************************** remove */

describe("remove", function () {
  test("works", async function () {
    await Job.remove(testJobIds[0]);
    const res = await db.query(
        "SELECT id FROM dogs WHERE id=$1", [testJobIds[0]]);
    expect(res.rows.length).toEqual(0);
  });

  test("not found if no such dog", async function () {
    try {
      await Job.remove(0);
      fail();
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  });
});
