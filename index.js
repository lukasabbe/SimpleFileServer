const app = require('express')();
const fileUpload = require('express-fileupload'); 
const fs = require('fs');
require('dotenv').config();

app.get('/', (req, res) => {
    res.json({"service":"Online"});
});

app.use(fileUpload());

app.post('/upload', (req, res) => {
    if(req.headers["authorization"].split(" ")[1] != process.env.AUTH_TOKEN) {
        return res.status(401).send("Unauthorized");
    }

    if (!req.files) {
        return res.status(400).send('No files were uploaded.');
    }
    let uploadedFile = req.files.file;
    let fileName = uploadedFile.name;

    if(fs.existsSync("./uploads/")) {
        fs.mkdirSync("./uploads/");
    }

    fs.writeFile("./data/"+fileName, uploadedFile.data, (err) => {
        if (err) {
            res.status(500).send(err);
        }
        res.json({"message":"File uploaded successfully"});
    })   
});

app.get('/download/:fileName', (req, res) => {
    let fileName = req.params.fileName;
    if(fs.existsSync("./data/"+fileName)) {
        return res.download("./data/"+fileName, fileName);
    }
    return res.status(404).send("File not found");
})


app.listen(3000, () => {
    console.log('Server is running on port 3000');
});