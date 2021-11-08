process.env.NODE_ENV = "test"
const request = require("supertest");
const app = require("./app")
const db = require("./db")

beforeEach(async () => {
    await db.query(`
    DROP TABLE IF EXISTS invoices CASCADE;
    DROP TABLE IF EXISTS companies CASCADE;
    DROP TABLE IF EXISTS industries CASCADE;
    DROP TABLE IF EXISTS comp_industries CASCADE;
    
    CREATE TABLE companies (
        code text PRIMARY KEY,
        name text NOT NULL UNIQUE,
        description text
    );
    
    CREATE TABLE invoices (
        id serial PRIMARY KEY,
        comp_code text NOT NULL REFERENCES companies ON DELETE CASCADE,
        amt float NOT NULL,
        paid boolean DEFAULT false NOT NULL,
        add_date date DEFAULT CURRENT_DATE NOT NULL,
        paid_date date,
        CONSTRAINT invoices_amt_check CHECK ((amt > (0)::double precision))
    );
    
    CREATE TABLE industries (
      code text PRIMARY KEY,
      industry text NOT NULL
    );
    
    CREATE TABLE comp_industries (
      comp_code text NOT NULL REFERENCES companies ON DELETE CASCADE,
      ind_code text NOT NULL REFERENCES industries ON DELETE CASCADE
    );
    
    INSERT INTO companies
      VALUES ('appl', 'Apple Computer', 'Maker of OSX.'),
             ('ibm', 'IBM', 'Big blue.');
    
    INSERT INTO invoices (comp_Code, amt, paid, paid_date)
      VALUES ('appl', 100, false, null),
             ('appl', 200, false, null),
             ('appl', 300, true, '2018-01-01'),
             ('ibm', 400, false, null);
    
    INSERT INTO industries
      VALUES ('acct', 'Accounting'), ('tech', 'General technologies');
    
    INSERT INTO comp_industries
      VALUES ('appl', 'tech'), ('ibm', 'tech');
    `)
});

afterAll(async () => {
    await db.end();
});

describe('/companies', () => {
    test("Gets a list of all companies", async () => {
        const response = await request(app).get('/companies');
        expect(response.statusCode).toEqual(200);
        expect(response.body).toEqual({
            "companies": [
              {
                "code": "appl",
                "name": "Apple Computer",
                "description": "Maker of OSX."
              },
              {
                "code": "ibm",
                "name": "IBM",
                "description": "Big blue."
              }
            ]
          })
    })

    test("Gets data and invoices on appl", async () => {
        const response = await request(app).get('/companies/appl');
        expect(response.statusCode).toEqual(200)
        expect(response.body).toEqual({
            "company": {
              "code": "appl",
              "name": "Apple Computer",
              "description": "Maker of OSX."
            },
            "invoices": [
              {
                "id": 1,
                "comp_code": "appl",
                "amt": 100,
                "paid": false,
                "add_date": "2021-11-07T10:00:00.000Z",
                "paid_date": null
              },
              {
                "id": 2,
                "comp_code": "appl",
                "amt": 200,
                "paid": false,
                "add_date": "2021-11-07T10:00:00.000Z",
                "paid_date": null
              },
              {
                "id": 3,
                "comp_code": "appl",
                "amt": 300,
                "paid": true,
                "add_date": "2021-11-07T10:00:00.000Z",
                "paid_date": "2018-01-01T10:00:00.000Z"
              }
            ]
          })
    })

    test("Recieves a 404 on invalid company name", async () => {
        const response = await request(app).get('/companies/1')
        expect(response.statusCode).toEqual
    })

    test("Creates a new company entry", async () => {
        const response = await request(app).post('/companies').send({"name" : "KVSafe", "description" : "Password manager"})
        expect(response.statusCode).toEqual(201)
        expect(response.body).toEqual({
            "code": "kvsa",
            "name": "KVSafe",
            "description": "Password manager"
          })
    })

    test("Updates a company entry", async () => {
        const response = await request(app).put('/companies/appl').send({"name" : "Apple", "description" : "Apple technologies"})
        expect(response.statusCode).toEqual(201)
        expect(response.body).toEqual({
            "code": "appl",
            "name": "Apple",
            "description": "Apple technologies"
          })
    })

    test("Deletes an entry", async () => {
        const response  = await request(app).delete('/companies/appl')
        expect(response.statusCode).toEqual(202)
    })
})