const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
app.use(express.json());
app.use(express.urlencoded({extended:true}));
app.use(express.static(path.join(__dirname,'public')))
app.set('view engine','ejs');

app.use(function(req,res,next){
    console.log("middleware hai");
    next();
})

app.get("/",function(req,res){
    fs.readdir('./files', function (err, files) {
        res.render("index", { files: files });
      });      
})

app.get("/file/:filename", (req, res) => {
  fs.readFile(`./files/${req.params.filename}`, 'utf-8', (err, filedata) => {
    if (err) {
      return res.status(404).send('File not found');
    }
    res.render('show', { filename: req.params.filename, filedata });
  });
});

app.get("/edit/:filename", (req, res) => {
  const filename = req.params.filename;
  const filePath = path.join(__dirname, 'files', filename);

  fs.readFile(filePath, 'utf-8', (err, data) => {
    if (err) {
      console.error('File read error:', err);
      return res.status(404).send('File not found');
    }
    // Pass both filename and current content to the edit template
    res.render('edit', { filename: filename, filedata: data });
  });
});


app.post('/edit', (req, res) => {
  const oldName = req.body.previous;
  const newName = req.body.new || oldName;
  const newContent = req.body.newDescription;

  const oldPath = path.join(__dirname, 'files', oldName);
  const newPath = path.join(__dirname, 'files', newName);

  // Rename (if the filename was changed)
  const renameNeeded = oldName !== newName;

  const proceedToWrite = () => {
    fs.writeFile(newPath, newContent, (err) => {
      if (err) {
        console.error('Write Error:', err);
        return res.status(500).send('Error writing content');
      }
      res.redirect('/');
    });
  };

  if (renameNeeded) {
    fs.rename(oldPath, newPath, (err) => {
      if (err) {
        console.error('Rename Error:', err);
        return res.status(500).send('Error renaming file');
      }
      proceedToWrite();
    });
  } else {
    proceedToWrite();
  }
});


app.post('/create', (req, res) => {
    // 1) Log req.body to confirm it has { title: '...', details: '...' }
    console.log(req.body);
  
    // 2) Use the correct field name: details (not deatils)
    fs.writeFile(`./files/${req.body.title.split(' ').join('')}.txt`, req.body.details, (err) => {
      if (err) {
        console.error('Error writing file:', err);
        return res.status(500).send('Error saving file');
      }
      res.redirect("/");
    });
  });

app.post('/delete/:filename', (req, res) => {
    const filename = req.params.filename;
    const filePath = path.join(__dirname, 'files', filename);

    fs.unlink(filePath, (err) => {
        if (err) {
            console.error('Failed to delete file:', err);
            return res.status(500).send("Error deleting file");
        }
        res.redirect('/');
    });
});



app.listen(3000,function(req,res){
    console.log("Server is running");
})

