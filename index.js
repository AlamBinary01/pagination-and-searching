const express = require("express");
const app = express();
const path = require("path");
const mysql = require("mysql");
const ejs = require("ejs");
const body_parser = require("body-parser");
const multer = require("multer");
const { connected } = require("process");
const port = process.env.port | 3000;

//connection
const connection = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "crud",
});
connection.connect(function (error) {
  if (error) console.log(error);
  else console.log(" Poyon Oil");
});

app.use(express.static("public"));
// set view file
app.set("views", path.join(__dirname, "views"));

// set view engine
app.set("view engine", "ejs");
app.use(body_parser.json());
app.use(body_parser.urlencoded({ extended: false }));

//multer file storage
// var multerstorage = multer.diskStorage({
//   destination: function (req, file, callback) {
//     callback(null, path.join(__dirname, "./public/images"));
//   },
//   filename: function (req, file, callback) {
//     callback(null, Date.now() + "_" + file.originalname);
//   },
// });
// //file upload
// var multerupload = multer({ storage: multerstorage });

// select *
// app.get("/", (req, res) => {
//   let sql = " SELECT * FROM  BOOK";
//   let query = connection.query(sql, (err, rows) => {
//     if (err) throw err;

//     res.render("user_index", {
//       user: rows,
//       title: "Library Management System",
//     });
//   });
// });

//add books
app.get("/add", (req, res) => {
  res.render("book_add", {
    title: "Add Books",
  });
});
//save
app.post("/save", (req, res) => {
  let data = {
    book_id: req.body.book_id,
    book_name: req.body.book_name,
    author_name: req.body.author_name,
    department: req.body.department,
    rack_no: req.body.rack_no,
  };
  let sql = "INSERT INTO BOOK SET ?";
  let query = connection.query(sql, data, (err, results) => {
    if (err) throw err;
    res.redirect("/");
  });
});

//edit
app.get("/edit/:bookId", (req, res) => {
  const book_id = req.params.bookId;
  let sql = `SELECT * FROM BOOK WHERE book_id =${book_id}`;
  let query = connection.query(sql, (err, results) => {
    if (err) throw err;
    res.render("edit_book", {
      title: "Edit Books",
      user: results[0],
    });
  });
});

//update

app.post("/update", (req, res) => {
  const book_id = req.body.book_id;
  let sql =
    "UPDATE BOOK SET book_id='" +
    req.body.book_id +
    " ', book_name='" +
    req.body.book_name +
    " ',author_name='" +
    req.body.author_name +
    " ',department='" +
    req.body.department +
    " ',rack_no='" +
    req.body.rack_no +
    " ' where book_id= " +
    book_id;
  let query = connection.query(sql, (err, results) => {
    if (err) throw err;
    res.redirect("/");
  });
});

//delete
app.get("/delete/:bookId", (req, res) => {
  const book_id = req.params.bookId;
  let sql = `DELETE FROM BOOK WHERE book_id =${book_id}`;
  let query = connection.query(sql, (err, results) => {
    if (err) throw err;
    res.redirect("/");
  });
});


app.get("/", (req, res) => {
  const dataCountQuery = "SELECT COUNT(*) FROM book";
  connection.query(dataCountQuery, function (err, result) {
    if (err) throw err;

    let dataCount = result[0]["COUNT(*)"];
    let pageNo = req.query.page ? req.query.page : 1;
    let dataPerPages = req.query.data ? req.query.data : 3;
    let startLimit = (pageNo - 1) * dataPerPages;
    let totalPages = Math.ceil(dataCount / dataPerPages);

    // console.log(dataCount, "\n", pageNo, "\n",dataPerPages, "\n",startLimit, "\n",totalPages, "\n");

    const Query = `SELECT * FROM book LIMIT ${startLimit}, ${dataPerPages}`;
    connection.query(Query, function (err, result) {
      if (err) throw err;
      // res.send(result);
      res.render("user_index", {
        user: result,
        pages: totalPages,
        CurrentPage: pageNo,
        lastPage: totalPages,
        title: "Library Management System",
      });
    });
  });
});


//search
app.get("/search", (req, res) => { res.render("search"); });
app.post('/search', (req, res) => {
    const username = req.body.sname;
    const dataCountQuery = `SELECT COUNT(*) FROM book where book_id = ${username}`;
    connection.query(dataCountQuery, function(err,result){
        if(err) throw err;

        let dataCount = result[0]["COUNT(*)"];
        let pageNo = req.query.page ? req.query.page : 1;
        let dataPerPages = req.query.data ? req.query.data : 2;
        let startLimit = (pageNo - 1) * dataPerPages;
        let totalPages = Math.ceil(dataCount/dataPerPages);

        const Query = `SELECT * FROM book where book_id = ${username}`;
        connection.query(Query, function(err,result){
            if(err) throw err;
            // res.send(result);
            res.render( "search", 
                 {
                    user: result,
                    pages: totalPages,
                    CurrentPage: pageNo,
                    lastPage: totalPages,
                    title:"Library Management System"
                 }
            );
      })
});
});

app.get("/Sorting/:sorting/:page", (req, res) => {

  const dataCountQuery = "SELECT COUNT(*) FROM book";
  connection.query(dataCountQuery, function (err, result) {
      if (err) throw err;

      let sorting = req.params.sorting;
      let dataCount = result[0]["COUNT(*)"];
      let pageNo = req.params.page ? req.params.page : 1;
      let dataPerPages = req.query.data ? req.query.data : 2;
      let startLimit = (pageNo - 1) * dataPerPages;
      let totalPages = Math.ceil(dataCount / dataPerPages);

      const Query = `SELECT * FROM book ORDER BY book_id ${sorting} LIMIT ${startLimit}, ${dataPerPages} `;
      connection.query(Query, function (err, result) {
          if (err) throw err;
          res.render("user_index", {
              user: result,
              pages: totalPages,
              CurrentPage: pageNo,
              lastPage: totalPages,
              title:"Library Management System"

          });})
})
})

//server Listening
app.listen(port, () => {
  console.log("Server Listening on http://localhost:3000");
});
