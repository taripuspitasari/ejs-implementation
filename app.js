const express = require("express");
const expressLayouts = require("express-ejs-layouts");
const {loadContact, findContact} = require("./utils/contacts");

const app = express();
const port = 3001;

// gunakan ejs
app.set("view engine", "ejs");
app.use(expressLayouts);

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
  });
});

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
