"use strict";

const request = require("supertest");

const app = require("../app");

const {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll,
  testDogIds,
  u1Token,
  adminToken,
} = require("./_testCommon");

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

/************************************** POST /dogs */

describe("POST /dogs", function () {
  test("ok for admin", async function () {
    const resp = await request(app)
        .post(`/dogs`)
        .send({
          shelterHandle: "c1",
          title: "J-new",
          salary: 10,
          equity: "0.2",
        })
        .set("authorization", `Bearer ${adminToken}`);
    expect(resp.statusCode).toEqual(201);
    expect(resp.body).toEqual({
      dog: {
        id: expect.any(Number),
        title: "J-new",
        salary: 10,
        equity: "0.2",
        shelterHandle: "c1",
      },
    });
  });

  test("unauth for users", async function () {
    const resp = await request(app)
        .post(`/dogs`)
        .send({
          shelterHandle: "c1",
          title: "J-new",
          salary: 10,
          equity: "0.2",
        })
        .set("authorization", `Bearer ${u1Token}`);
    expect(resp.statusCode).toEqual(401);
  });

  test("bad request with missing data", async function () {
    const resp = await request(app)
        .post(`/dogs`)
        .send({
          shelterHandle: "c1",
        })
        .set("authorization", `Bearer ${adminToken}`);
    expect(resp.statusCode).toEqual(400);
  });

  test("bad request with invalid data", async function () {
    const resp = await request(app)
        .post(`/dogs`)
        .send({
          shelterHandle: "c1",
          title: "J-new",
          salary: "not-a-number",
          equity: "0.2",
        })
        .set("authorization", `Bearer ${adminToken}`);
    expect(resp.statusCode).toEqual(400);
  });

});

/************************************** GET /dogs */

describe("GET /dogs", function () {
  test("ok for anon", async function () {
    const resp = await request(app).get(`/dogs`);
    expect(resp.body).toEqual({
          dogs: [
            {
              id: expect.any(Number),
              title: "J1",
              salary: 1,
              equity: "0.1",
              shelterHandle: "c1",
              shelterName: "C1",
            },
            {
              id: expect.any(Number),
              title: "J2",
              salary: 2,
              equity: "0.2",
              shelterHandle: "c1",
              shelterName: "C1",
            },
            {
              id: expect.any(Number),
              title: "J3",
              salary: 3,
              equity: null,
              shelterHandle: "c1",
              shelterName: "C1",
            },
          ],
        },
    );
  });

  test("works: filtering", async function () {
    const resp = await request(app)
        .get(`/dogs`)
        .query({ hasEquity: true });
    expect(resp.body).toEqual({
          dogs: [
            {
              id: expect.any(Number),
              title: "J1",
              salary: 1,
              equity: "0.1",
              shelterHandle: "c1",
              shelterName: "C1",
            },
            {
              id: expect.any(Number),
              title: "J2",
              salary: 2,
              equity: "0.2",
              shelterHandle: "c1",
              shelterName: "C1",
            },
          ],
        },
    );
  });

  test("works: filtering on 2 filters", async function () {
    const resp = await request(app)
        .get(`/dogs`)
        .query({ minSalary: 2, title: "3" });
    expect(resp.body).toEqual({
          dogs: [
            {
              id: expect.any(Number),
              title: "J3",
              salary: 3,
              equity: null,
              shelterHandle: "c1",
              shelterName: "C1",
            },
          ],
        },
    );
  });

  test("bad request on invalid filter key", async function () {
    const resp = await request(app)
        .get(`/dogs`)
        .query({ minSalary: 2, nope: "nope" });
    expect(resp.statusCode).toEqual(400);
  });
});

/************************************** GET /dogs/:id */

describe("GET /dogs/:id", function () {
  test("works for anon", async function () {
    const resp = await request(app).get(`/dogs/${testDogIds[0]}`);
    expect(resp.body).toEqual({
      dog: {
        id: testDogIds[0],
        title: "J1",
        salary: 1,
        equity: "0.1",
        shelter: {
          handle: "c1",
          name: "C1",
          description: "Desc1",
          numEmployees: 1,
          logoUrl: "http://c1.img",
        },
      },
    });
  });

  test("not found for no such dog", async function () {
    const resp = await request(app).get(`/dogs/0`);
    expect(resp.statusCode).toEqual(404);
  });
});

/************************************** PATCH /dogs/:id */

describe("PATCH /dogs/:id", function () {
  test("works for admin", async function () {
    const resp = await request(app)
        .patch(`/dogs/${testDogIds[0]}`)
        .send({
          title: "J-New",
        })
        .set("authorization", `Bearer ${adminToken}`);
    expect(resp.body).toEqual({
      dog: {
        id: expect.any(Number),
        title: "J-New",
        salary: 1,
        equity: "0.1",
        shelterHandle: "c1",
      },
    });
  });

  test("unauth for others", async function () {
    const resp = await request(app)
        .patch(`/dogs/${testDogIds[0]}`)
        .send({
          title: "J-New",
        })
        .set("authorization", `Bearer ${u1Token}`);
    expect(resp.statusCode).toEqual(401);
  });

  test("not found on no such dog", async function () {
    const resp = await request(app)
        .patch(`/dogs/0`)
        .send({
          handle: "new",
        })
        .set("authorization", `Bearer ${adminToken}`);
    expect(resp.statusCode).toEqual(400);
  });

  test("bad request on handle change attempt", async function () {
    const resp = await request(app)
        .patch(`/dogs/${testDogIds[0]}`)
        .send({
          handle: "new",
        })
        .set("authorization", `Bearer ${adminToken}`);
    expect(resp.statusCode).toEqual(400);
  });

  test("bad request with invalid data", async function () {
    const resp = await request(app)
        .patch(`/dogs/${testDogIds[0]}`)
        .send({
          salary: "not-a-number",
        })
        .set("authorization", `Bearer ${adminToken}`);
    expect(resp.statusCode).toEqual(400);
  });
});

/************************************** DELETE /dogs/:id */

describe("DELETE /dogs/:id", function () {
  test("works for admin", async function () {
    const resp = await request(app)
        .delete(`/dogs/${testDogIds[0]}`)
        .set("authorization", `Bearer ${adminToken}`);
    expect(resp.body).toEqual({ deleted: testDogIds[0] });
  });

  test("unauth for others", async function () {
    const resp = await request(app)
        .delete(`/dogs/${testDogIds[0]}`)
        .set("authorization", `Bearer ${u1Token}`);
    expect(resp.statusCode).toEqual(401);
  });

  test("unauth for anon", async function () {
    const resp = await request(app)
        .delete(`/dogs/${testDogIds[0]}`);
    expect(resp.statusCode).toEqual(401);
  });

  test("not found for no such dog", async function () {
    const resp = await request(app)
        .delete(`/dogs/0`)
        .set("authorization", `Bearer ${adminToken}`);
    expect(resp.statusCode).toEqual(404);
  });
});
