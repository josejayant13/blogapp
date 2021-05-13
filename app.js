require('dotenv').config()
//modules
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require('mongoose');

const app = express();
app.set('view engine', 'ejs');

//use methods
app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(express.static("public"));

//databases
//// post collection
mongoose.connect(process.env.DB_KEY, {
  useNewUrlParser: true,
  useUnifiedTopology: true
});
const postSchema = {
  title: String,
  content: String
};
const Post = mongoose.model("Post", postSchema);

//// user collection
const userSchema = {
  email: String,
  password: String
};
const User = new mongoose.model("User", userSchema);

//// parsedData collection
const dataSchema = {
  title: String,
  data: Object,
  dateCreated: String,
  timeCreated: String
};
const Data = new mongoose.model("Data",dataSchema);

//data members
const homeStartingContent = "Lacus vel facilisis volutpat est velit egestas dui id ornare. Semper auctor neque vitae tempus quam. Sit amet cursus sit amet dictum sit amet justo. Viverra tellus in hac habitasse. Imperdiet proin fermentum leo vel orci porta. Donec ultrices tincidunt arcu non sodales neque sodales ut. Mattis molestie a iaculis at erat pellentesque adipiscing. Magnis dis parturient montes nascetur ridiculus mus mauris vitae ultricies. Adipiscing elit ut aliquam purus sit amet luctus venenatis lectus. Ultrices vitae auctor eu augue ut lectus arcu bibendum at. Odio euismod lacinia at quis risus sed vulputate odio ut. Cursus mattis molestie a iaculis at erat pellentesque adipiscing.";
const aboutContent = "Hac habitasse platea dictumst vestibulum rhoncus est pellentesque. Dictumst vestibulum rhoncus est pellentesque elit ullamcorper. Non diam phasellus vestibulum lorem sed. Platea dictumst quisque sagittis purus sit. Egestas sed sed risus pretium quam vulputate dignissim suspendisse. Mauris in aliquam sem fringilla. Semper risus in hendrerit gravida rutrum quisque non tellus orci. Amet massa vitae tortor condimentum lacinia quis vel eros. Enim ut tellus elementum sagittis vitae. Mauris ultrices eros in cursus turpis massa tincidunt dui.";
const contactContent = "Scelerisque eleifend donec pretium vulputate sapien. Rhoncus urna neque viverra justo nec ultrices. Arcu dui vivamus arcu felis bibendum. Consectetur adipiscing elit duis tristique. Risus viverra adipiscing at in tellus integer feugiat. Sapien nec sagittis aliquam malesuada bibendum arcu vitae. Consequat interdum varius sit amet mattis. Iaculis nunc sed augue lacus. Interdum posuere lorem ipsum dolor sit amet consectetur adipiscing elit. Pulvinar elementum integer enim neque. Ultrices gravida dictum fusce ut placerat orci nulla. Mauris in aliquam sem fringilla ut morbi tincidunt. Tortor posuere ac ut consequat semper viverra nam libero.";
var loggedIn = false;

//functions
function parsePage(id,title,content) {

  var paragraph = content;
  var tableRegex = /<table>.*?Technical Specifications.*?<\/table>/gm;
  var rowRegex = /<tr><td>.*?<\/td><\/tr>/gm;
  var cellRegex = /<td>(.*?)<\/td>/gm;
  let obj = {};
  var prop = [];
  var value = [];
  let table = tableRegex.exec(paragraph);
  let n;
  if (table) {

    while ((row = rowRegex.exec(table[0])) !== null) {
      if (row.index === rowRegex.lastIndex) {
        rowRegex.lastIndex++;
      }
      row[0] = row[0].replace(/<tr>|<\/tr>/gm, '');
      var cell;

      while ((cell = cellRegex.exec(row[0])) !== null) {
        cell[0] = cell[0].replace(/<td>|<\/td>/gm, '');
        //console.log(cell);
        if (cell.index == 0) {
          prop.push(cell[0]);
        } else {
          value.push(cell[0]);
        }
      }


    }
  } else {
    console.log('null');
  }
  for (var i = 0; i < prop.length; i++) {
    obj[prop[i]] = value[i];
  }
  console.log(obj);
  var d = new Date().toLocaleDateString();
  var t = new Date().toLocaleTimeString();
  const data = new Data({title: title,_id: id,data: obj,dateCreated: d,timeCreated: t});
  data.save(function (err) {
    if (!err) {
      console.log("parsed Data added successfully");
    }
  });
}


//get methods
app.get("/", function (req, res) {

  Post.find({}, function (err, posts) {
    res.render("home", {
      startingContent: homeStartingContent,
      posts: posts,
      isLoggedIn: loggedIn
    });
  });
});

app.get("/compose", function (req, res) {
  if (loggedIn)
    res.render("compose", {
      isLoggedIn: loggedIn
    });
});

app.get("/posts/:postId", function (req, res) {

  const requestedPostId = req.params.postId;

  Post.findOne({
    _id: requestedPostId
  }, function (err, post) {
    res.render("post", {
      title: post.title,
      content: post.content,
      isLoggedIn: loggedIn
    });
  });

});
app.get("/delete/:postId", (req, res) => {
  if (loggedIn) {
    const requestedPostId = req.params.postId;
    Data.deleteOne({
      _id: requestedPostId
    }, function (err) {
      if (err) {
        console.log(err);
      } else {
        console.log("parsed Data deleted successfully");
      }
    });
    Post.deleteOne({
      _id: requestedPostId
    }, function (err) {
      if (err) {
        console.log(err);
      } else {
        console.log("Post deleted successfully");
        res.redirect("/");
      }
    });
  }
});

app.get("/about", function (req, res) {
  res.render("about", {
    aboutContent: aboutContent,
    isLoggedIn: loggedIn
  });
});

app.get("/contact", function (req, res) {
  res.render("contact", {
    contactContent: contactContent,
    isLoggedIn: loggedIn
  });
});

app.get('/register', (req, res) => {
  res.render('register');
});

app.get('/login', (req, res) => {
  res.render("login", {
    isLoggedIn: loggedIn
  });
});

app.get('/logout', (req, res) => {
  loggedIn = false;
  console.log("Successfully Logged Out");
  res.redirect('/');
});

//post methods
app.post("/compose", function (req, res) {
  //console.log(req.body);
  const post = new Post({
    title: req.body.postTitle,
    content: req.body.postBody,
  });
  parsePage(post._id,post.title,post.content);
  post.save(function (err) {
    if (!err) {
      console.log("post added successfully");
      res.redirect("/");
    }
  });
});

// app.post("/register",(req,res)=>{
//   const newUser = new User({
//     email: req.body.username,
//     password: req.body.password
//   });
//   newUser.save(err=>{
//     if(err)
//       console.log(err);
//     else{
//       console.log("User registered successfully");
//       res.redirect("/");
//     }
//   });
// });

app.post('/login', (req, res) => {
  const username = req.body.username;
  const password = req.body.password;

  User.findOne({
    email: username
  }, (err, foundUser) => {
    if (err)
      console.log(err);
    else {
      if (foundUser) {
        if (foundUser.password === password) {
          loggedIn = true;
          console.log("Successfully Logged In");
          res.redirect('/');
        }
      }
    }
  });
});

//connection
let port = process.env.PORT;
if (port == null || port == "")
  port = 3000;
app.listen(port, function () {
  console.log("Server started successfully");
});