const app = require('express')();
const fileUpload = require('express-fileupload'); 
const cors = require('cors');
const fs = require('fs');
require('dotenv').config();

app.get('/', (req, res) => {
    res.json({"service":"Online"});
});

app.use(cors());

app.use(fileUpload());

app.post('/upload', (req, res) => {

    if(!req.headers["authorization"]) {
        return res.status(401).send("Unauthorized");
    }

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
            return res.status(500).send(err);
        }
        res.json({"message":"File uploaded successfully"});
    })   
});

app.get('/download/:fileName', (req, res) => {
    let fileName = req.params.fileName;
    if(fs.existsSync("./data/"+fileName)) {
        if(!fs.existsSync("./data/data.json")){
            fs.writeFileSync("./data/data.json", JSON.stringify([{fileName:fileName, downloads:1}]));
        }else{
            let data = JSON.parse(fs.readFileSync("./data/data.json"));
            let found = false;
            data.forEach(file => {
                if(file.fileName == fileName) {
                    file.downloads++;
                    found = true;
                }
            });
            if(!found) {
                data.push({fileName:fileName, downloads:1});
            }
            fs.writeFileSync("./data/data.json", JSON.stringify(data));
        }
        return res.download("./data/"+fileName, fileName);
    }
    return res.status(404).send("File not found");
})

app.get('/list', (req, res) => {
    fs.readdir("./data/", (err, files) => {
        if(err) {
            return res.status(500).send(err);
        }
        if(!fs.existsSync("./data/data.json")){
            fs.writeFileSync("./data/data.json", JSON.stringify([]));
        }
        let filesObjs = [];
        const data = fs.readFileSync("./data/data.json");
        const dataJson = JSON.parse(data);
        files.forEach(file => {
            const downloads = dataJson.find(f => f.fileName == file)
            filesObjs.push({"fileName":file, "link":"https://download.lukasabbe.com/download/"+file, "downloads": downloads ? downloads.downloads : 0});
        });
        res.json(filesObjs);
    });
});

app.listen(3010, () => {
    console.log('Server is running on port 3000');
});