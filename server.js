const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const path = require('path');
const multer=require('multer');
//const bcrypt = require('bcrypt');


const app = express();
const session = require('express-session');

app.use(session({
  secret: 'blogsecret', // change this to something secure
  resave: false,
  saveUninitialized: true
}));

const PORT = 3000;

// Connect to MongoDB
mongoose.connect('mongodb://127.0.0.1:27017/userDB', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'Connection error:'));
db.once('open', () => console.log('Connected to MongoDB'));

//setting EJS as the view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'html'));

// Middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'html')));
app.use('/images', express.static(path.join(__dirname, 'html/images')));
app.use(bodyParser.json());

// Schema
const userSchema = new mongoose.Schema({
    fullname: String,
    name:String,
    email:String,
    password: String,
    profilePic: String,
    bio: String,
    followers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  following: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  notifications: [{ message: String, timestamp: Date }]
});
const User = mongoose.model('User', userSchema);

// Blog Schema
const blogSchema = new mongoose.Schema({
  title: String,
  content: String,
  tags: [String],
  imagePath: String,
  createdAt: { type: Date, default: Date.now },
  authorEmail: String,
  authorName: String,
  authorId: mongoose.Schema.Types.ObjectId,

});
const Blog = mongoose.model('Blog', blogSchema);

// Multer (for image upload)
const storage = multer.diskStorage({
  destination: './html/images',
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  }
});
const upload = multer({ storage });

app.get('/signup', (req, res) => {
  res.render('signup', { error: null });
});

// Signup POST
app.post('/signup', async (req, res) => {
  const { fullname, email, password, confirmPassword } = req.body;

  if (password !== confirmPassword) {
    return res.render('signup', { error: 'Passwords do not match!' });

  }

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return res.render('signup', { error: 'Email already registered!' });

  }

  //const hashedpassword=await bcrypt.hash(password,10);(in next line password:hashedpassword)
  const newUser = new User({ fullname, email, password });
  await newUser.save();
  // ✅ Set session after signup
  req.session.user = {
    name: newUser.fullname,
    email: newUser.email,
    id:newUser._id
  };
  res.redirect('/home');
  
});
// ✅ Login GET route 
app.get('/login', (req, res) => {
  res.render('login', { error: null });
});
// ✅ Forgot Password GET
app.get('/forgot-password', (req, res) => {
  res.render('forgot-password', { message: null });
});
// ✅ Forgot Password POST
app.post('/forgot-password', async (req, res) => {
  const { email } = req.body;

  const user = await User.findOne({ email });

  if (!user) {
    return res.render('forgot-password', { message: 'No account found with this email.' });
  }

  // Setup Nodemailer transporter
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'yourgmail@gmail.com',       // ✅ your Gmail
      pass: 'your-app-password'          // ✅ App Password (not Gmail password!)
    }
  });

  const resetLink = `http://localhost:3000/reset-password?email=${email}`;

  const mailOptions = {
    from: 'yourgmail@gmail.com',
    to: email,
    subject: 'Password Reset - MyBlogSpace',
    html: `<p>Click below to reset your password:</p><a href="${resetLink}">Reset Password</a>`
  };

  try {
    await transporter.sendMail(mailOptions);
    res.render('forgot-password', { message: 'Reset link sent to your email!' });
  } catch (error) {
    console.error(error);
    res.render('forgot-password', { message: 'Error sending email. Try again.' });
  }
});
// ✅ Reset Password GET
app.get('/reset-password', (req, res) => {
  const { email } = req.query;
  res.render('reset-password', { email, error: null });
});

// ✅ Reset Password POST
app.post('/reset-password', async (req, res) => {
  const { email, newPassword, confirmPassword } = req.body;

  if (newPassword !== confirmPassword) {
    return res.render('reset-password', { email, error: 'Passwords do not match.' });
  }

  await User.updateOne({ email }, { password: newPassword });
  res.redirect('/login');
});

// Login POST
app.post('/login', async (req, res) => {
  const { name, email, password } = req.body;
  const user = await User.findOne({ email, password });

  if (user && user.fullname.includes(name)) {
    req.session.user={
      name:user.fullname,
      email: user.email
    };
    res.redirect('/home');
  } else {
    res.render('login', { error: 'Wrong password. Try again!' });
  }
});

// 🆕 Get Home Page with All Blogs
app.get('/home', async (req, res) => {
  if (!req.session.user || !req.session.user.email) {
    return res.redirect('/login');
  }
  const currentUser = await User.findOne({ email: req.session.user.email });
  const blogs = await Blog.find().sort({ createdAt: -1 }).populate('authorId');
  res.render('home', { blogs, currentUserId: currentUser._id});
});
//profile route
app.get('/profil', async (req, res) => {
  if (!req.session.user) return res.redirect('/login');

  const user = await User.findOne({ email: req.session.user.email }).populate('followers');
  const userBlogs = await Blog.find({ authorEmail: user.email }).sort({ createdAt: -1 });

  res.render('profil', { user, userBlogs });
});
//notification
app.get('/notification', async (req, res) => {
  const user = await User.findOne({ email: req.session.user.email });
  res.render('notification', { notifications: user.notifications });
});

//edit-profile
app.get('/edit-profile', async (req, res) => {
  if (!req.session.user) return res.redirect('/login');

  const user = await User.findOne({ email: req.session.user.email });
  res.render('edit-profile', { user });
});
app.post('/edit-profile', upload.single('profilePic'), async (req, res) => {
  if (!req.session.user) return res.redirect('/login');

  const user = await User.findOne({ email: req.session.user.email });

  user.fullname = req.body.fullname;
  user.email = req.body.email;
  user.bio = req.body.bio;
  
  if (req.file) {
    user.profilePic = '/images/' + req.file.filename;
  }

  await user.save();

  req.session.user = {
    name: user.fullname,
    email: user.email
  };

  res.redirect('/profil');
});
// follow route
app.post('/follow', async (req, res) => {
  try{
  const { targetUserId } = req.body;
  const currentUser = await User.findOne({ email: req.session.user.email });
  const targetUser = await User.findById(targetUserId);

  if (!currentUser || !targetUser) return res.status(404).send('User not found');

  // Prevent duplicate follow
  if (!targetUser.followers.includes(currentUser._id)) {
    targetUser.followers.push(currentUser._id);
    currentUser.following.push(targetUser._id);

    // Add notification
    targetUser.notifications.push({
      message: `${currentUser.fullname} started following you.`,
      timestamp: new Date()
    });

   await Promise.all([targetUser.save(), currentUser.save()]);
  }
 res.json({ success: true });
  } catch (err) {
    console.error("Error in /follow:", err);
    res.status(500).json({ error: "Something went wrong" });
  }
});

//update-profile
const fs = require('fs');

app.post('/update-profile', upload.single('profilePic'), async (req, res) => {
  if (!req.session.user || !req.session.user.email) {
    return res.redirect('/login');
  }

  const { fullname, bio, email } = req.body;

  // Optional: Check if email already exists (if you allow email change)
  const existing = await User.findOne({ email });
  if (existing && existing.email !== req.session.user.email) {
    return res.send('Email already registered!');
  }

  const updateData = { fullname, bio, email };
  if (req.file) {
    updateData.profilePicPath = '/images/' + req.file.filename;
  }

  await User.updateOne({ email: req.session.user.email }, { $set: updateData });

  // Update session if email was changed
  req.session.user.email = email;

  res.redirect('/profil');
});


// 🆕 Submit Blog POST
app.post('/submit-blog', upload.single('image'), async (req, res) => {
  if (!req.session.user) return res.redirect('/login');

   const currentUser = await User.findOne({ email: req.session.user.email });

  const { title, content, tags } = req.body;
  const imagePath = req.file ? '/images/' + req.file.filename : '';

  const blog = new Blog({
    title,
    content,
    tags: tags.split(',').map(tag => tag.trim()),
    imagePath,
    authorEmail: req.session.user.email,  // ✅ gets from session
    authorName: req.session.user.name,     // ✅ gets name from session
    authorId: currentUser._id

  });

  await blog.save();
  res.redirect('/home');
});

// Start server
app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));
