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

/************************************** POST /shelters */

describe("POST /shelters", function () {
  const newShelter = {
    handle: "new",
    name: "New",
    logoUrl: "http://new.img",
    description: "DescNew",
    numEmployees: 10,
  };

  test("ok for admin", async function () {
    const resp = await request(app)
        .post("/shelters")
        .send(newShelter)
        .set("authorization", `Bearer ${adminToken}`);
    expect(resp.statusCode).toEqual(201);
    expect(resp.body).toEqual({
      shelter: newShelter,
    });
  });

  test("unauth for non-admin", async function () {
    const resp = await request(app)
        .post("/shelters")
        .send(newShelter)
        .set("authorization", `Bearer ${u1Token}`);
    expect(resp.statusCode).toEqual(401);
  });

  test("bad request with missing data", async function () {
    const resp = await request(app)
        .post("/shelters")
        .send({
          handle: "new",
          numEmployees: 10,
        })
        .set("authorization", `Bearer ${adminToken}`);
    expect(resp.statusCode).toEqual(400);
  });

  test("bad request with invalid data", async function () {
    const resp = await request(app)
        .post("/shelters")
        .send({
          ...newShelter,
          logoUrl: "not-a-url",
        })
        .set("authorization", `Bearer ${adminToken}`);
    expect(resp.statusCode).toEqual(400);
  });
});

/************************************** GET /shelters */

describe("GET /shelters", function () {
  test("ok for anon", async function () {
    const resp = await request(app).get("/shelters");
    expect(resp.body).toEqual({
      shelters:
          [
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
          ],
    });
  });

  test("works: filtering", async function () {
    const resp = await request(app)
        .get("/shelters")
        .query({ minEmployees: 3 });
    expect(resp.body).toEqual({
      shelters: [
        {
          handle: "c3",
          name: "C3",
          description: "Desc3",
          numEmployees: 3,
          logoUrl: "http://c3.img",
        },
      ],
    });
  });

  test("works: filtering on all filters", async function () {
    const resp = await request(app)
        .get("/shelters")
        .query({ minEmployees: 2, maxEmployees: 3, name: "3" });
    expect(resp.body).toEqual({
      shelters: [
        {
          handle: "c3",
          name: "C3",
          description: "Desc3",
          numEmployees: 3,
          logoUrl: "http://c3.img",
        },
      ],
    });
  });

  test("bad request if invalid filter key", async function () {
    const resp = await request(app)
        .get("/shelters")
        .query({ minEmployees: 2, nope: "nope" });
    expect(resp.statusCode).toEqual(400);
  });
});

/************************************** GET /shelters/:handle */

describe("GET /shelters/:handle", function () {
  test("works for anon", async function () {
    const resp = await request(app).get(`/shelters/c1`);
    expect(resp.body).toEqual({
      shelter: {
        handle: "c1",
        name: "C1",
        description: "Desc1",
        numEmployees: 1,
        logoUrl: "http://c1.img",
        dogs: [
          { id: testDogIds[0], title: "J1", equity: "0.1", salary: 1 },
          { id: testDogIds[1], title: "J2", equity: "0.2", salary: 2 },
          { id: testDogIds[2], title: "J3", equity: null, salary: 3 },
        ],
      },
    });
  });

  test("works for anon: shelter w/o dogs", async function () {
    const resp = await request(app).get(`/shelters/c2`);
    expect(resp.body).toEqual({
      shelter: {
        handle: "c2",
        name: "C2",
        description: "Desc2",
        numEmployees: 2,
        logoUrl: "http://c2.img",
        dogs: [],
      },
    });
  });

  test("not found for no such shelter", async function () {
    const resp = await request(app).get(`/shelters/nope`);
    expect(resp.statusCode).toEqual(404);
  });
});

/************************************** PATCH /shelters/:handle */

describe("PATCH /shelters/:handle", function () {
  test("works for admin", async function () {
    const resp = await request(app)
        .patch(`/shelters/c1`)
        .send({
          name: "C1-new",
        })
        .set("authorization", `Bearer ${adminToken}`);
    expect(resp.body).toEqual({
      shelter: {
        handle: "c1",
        name: "C1-new",
        description: "Desc1",
        numEmployees: 1,
        logoUrl: "http://c1.img",
      },
    });
  });

  test("unauth for non-admin", async function () {
    const resp = await request(app)
        .patch(`/shelters/c1`)
        .send({
          name: "C1-new",
        })
        .set("authorization", `Bearer ${u1Token}`);
    expect(resp.statusCode).toEqual(401);
  });

  test("unauth for anon", async function () {
    const resp = await request(app)
        .patch(`/shelters/c1`)
        .send({
          name: "C1-new",
        });
    expect(resp.statusCode).toEqual(401);
  });

  test("not found on no such shelter", async function () {
    const resp = await request(app)
        .patch(`/shelters/nope`)
        .send({
          name: "new nope",
        })
        .set("authorization", `Bearer ${adminToken}`);
    expect(resp.statusCode).toEqual(404);
  });

  test("bad request on handle change attempt", async function () {
    const resp = await request(app)
        .patch(`/shelters/c1`)
        .send({
          handle: "c1-new",
        })
        .set("authorization", `Bearer ${adminToken}`);
    expect(resp.statusCode).toEqual(400);
  });

  test("bad request on invalid data", async function () {
    const resp = await request(app)
        .patch(`/shelters/c1`)
        .send({
          logoUrl: "not-a-url",
        })
        .set("authorization", `Bearer ${adminToken}`);
    expect(resp.statusCode).toEqual(400);
  });
});

/************************************** DELETE /shelters/:handle */

describe("DELETE /shelters/:handle", function () {
  test("works for admin", async function () {
    const resp = await request(app)
        .delete(`/shelters/c1`)
        .set("authorization", `Bearer ${adminToken}`);
    expect(resp.body).toEqual({ deleted: "c1" });
  });

  test("unauth for non-admin", async function () {
    const resp = await request(app)
        .delete(`/shelters/c1`)
        .set("authorization", `Bearer ${u1Token}`);
    expect(resp.statusCode).toEqual(401);
  });

  test("unauth for anon", async function () {
    const resp = await request(app)
        .delete(`/shelters/c1`);
    expect(resp.statusCode).toEqual(401);
  });

  test("not found for no such shelter", async function () {
    const resp = await request(app)
        .delete(`/shelters/nope`)
        .set("authorization", `Bearer ${adminToken}`);
    expect(resp.statusCode).toEqual(404);
  });
});
