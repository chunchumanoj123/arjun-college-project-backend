const Pool = require("pg").Pool;
const pg = require("pg");

const pool = new Pool({
  connectionString: "postgres://default:rCDOsz5GiM8t@ep-morning-recipe-a4myt5w0.us-east-1.aws.neon.tech:5432/verceldb?sslmode=require",
})

pool.on("error", (error, client) => {
  console.log(error);
});

async function initDatabase() {

  const users = `create table if not exists users (
    user_id serial primary key not null,
    full_name text not null,
    email text not null,
    phone text not null,
    password text not null,
    type text not null
);
`
  const block = `
  create table if not exists block (
      block_id serial primary key not null,
      block_name text not null
  );`

  const student = `create table if not exists student (
    student_id int primary key not null,
    usn text ,
    room text
   
);`

  const warden = `create table if not exists warden (
  warden_id int primary key not null
  
);`

  const category = `create table if not exists category (
  category_id serial primary key not null,
  category_name text
);`

  const workers = `create table if not exists workers (
  worker_id int primary key not null,
  category_id int
  
);`


  const complaint = `create table if not exists complaint (
    id SERIAL PRIMARY KEY,
    name text ,
    category_id int ,
    student_id int ,
    assigned_worker_id int,
    warden_id int ,
    description text,
    room text,
    is_completed BOOLEAN,
    created_at timestamp,
    assigned_at timestamp
   
);
`
  await pool.query(users);
  await pool.query(block);
  await pool.query(student);
  await pool.query(warden);
  await pool.query(category);
  await pool.query(workers);
  await pool.query(complaint);

}

module.exports = {
  pool,
  initDatabase,
};
