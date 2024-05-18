const express = require("express");
const expressLayouts = require("express-ejs-layouts");
const {
  loadContact,
  findContact,
  addContact,
  cekDuplikat,
  deleteContact,
  updateContacts,
} = require("./utils/contacts");
const {body, validationResult, check} = require("express-validator");
const session = require("express-session");
const cookieParser = require("cookie-parser");
const flash = require("connect-flash");

const app = express();
const port = 3001;

// gunakan ejs
app.set("view engine", "ejs");
app.use(expressLayouts);
// app.use(express.static('public'));
app.use(express.urlencoded({extended: true}));

// konfigurasi flash
app.use(cookieParser("secret"));
app.use(
  session({
    cookie: {maxAge: 6000},
    secret: "secret",
    resave: true,
    saveUninitialized: true,
  })
);

app.use(flash());

app.get("/", (req, res) => {
  res.render("index", {
    layout: "layouts/main-layout",
    title: "halaman home",
  });
});

app.get("/about", (req, res) => {
  res.render("about", {
    layout: "layouts/main-layout",
    title: "halaman about",
  });
});

app.get("/contact", (req, res) => {
  const contacts = loadContact();

  res.render("contact", {
    layout: "layouts/main-layout",
    title: "halaman contact",
    contacts,
    msg: req.flash("msg"),
  });
});

// halaman form tambah data contact
app.get("/contact/add", (req, res) => {
  res.render("add-contact", {
    layout: "layouts/main-layout",
    title: "Form Tambah Data Contact",
  });
});

// proses data contact
app.post(
  "/contact",
  [
    body("nama").custom(value => {
      const duplikat = cekDuplikat(value);
      if (duplikat) {
        throw new Error("Nama contact sudah terdaftar!");
      }
      return true;
    }),
    check("email", "Email tidak valid!").isEmail(),
    check("nohp", "No Hp tidak valid!").isMobilePhone("id-ID"),
  ],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      // return res.status(400).json({errors: errors.array()});
      res.render("add-contact", {
        title: "Form Tambah Data Contact",
        layout: "layouts/main-layout",
        errors: errors.array(),
      });
    } else {
      addContact(req.body);
      // kirimkan flash message
      req.flash("msg", "Data contact berhasil ditambahkan!");
      res.redirect("/contact");
    }
  }
);

// proses delete contact
app.get("/contact/delete/:nama", (req, res) => {
  const contact = findContact(req.params.nama);
  // jika contact idak ada
  if (!contact) {
    res.status(404);
    res.send("<h1>404</h1>");
  } else {
    deleteContact(req.params.nama);
    // kirimkan flash message
    req.flash("msg", "Data contact berhasil dihapus!");
    res.redirect("/contact");
  }
});

// halaman form ubah data contact
app.get("/contact/edit/:nama", (req, res) => {
  const contact = findContact(req.params.nama);

  res.render("edit-contact", {
    layout: "layouts/main-layout",
    title: "Form Ubah Data Contact",
    contact,
  });
});

// halaman ubah contact
app.post(
  "/contact/update",
  [
    body("nama").custom((value, {req}) => {
      const duplikat = cekDuplikat(value);
      if (value !== req.body.oldNama && duplikat) {
        throw new Error("Nama contact sudah terdaftar!");
      }
      return true;
    }),
    check("email", "Email tidak valid!").isEmail(),
    check("nohp", "No Hp tidak valid!").isMobilePhone("id-ID"),
  ],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.render("edit-contact", {
        title: "Form Ubah Data Contact",
        layout: "layouts/main-layout",
        errors: errors.array(),
        contact: req.body,
      });
    } else {
      res.send(req.body);
      updateContacts(req.body);
      // kirimkan flash message
      req.flash("msg", "Data contact berhasil diubah!");
      res.redirect("/contact");
    }
  }
);

// halaman detail contact
app.get("/contact/:nama", (req, res) => {
  const contact = findContact(req.params.nama);

  res.render("detail", {
    layout: "layouts/main-layout",
    title: "halaman detail contact",
    contact,
  });
});

app.listen(port, () => {
  console.log(`app listen on port ${port}`);
});
