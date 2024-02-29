const mongoose = require("mongoose");
const Document = require("./Document");

mongoose.connect("mongodb://localhost/google-docs-clone", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useFindAndModify: false,
  useCreateIndex: true,
})

const defaultValue = "";

const io = require("socket.io")(3001, {
    cors: {
        origin: 'http://localhost:3000',
        methods: ['GET','POST'],    //methods that we should allow from different origin (react-app)

    }
}) 
io.on("connection", socket => {
    socket.on("get-document", async documentId => {
        const document = await findOrCreateDocument(documentId);
        socket.join(documentId)
        socket.emit("load-document",document.data)
    
    socket.on('send-changes',(delta) => {
        socket.broadcast.to(documentId).emit("receive-changes",delta)
    })

    // saving document
    socket.on("save-document",async data => {
        await Document.findByIdAndUpdate(documentId,{ data })
    })
})
})

function findOrCreateDocument(id) {
    if(id == null) return;

    const document = Document.findById(id)
    if(document) return document;

    return document.create({
        _id : id,
        data : defaultValue
    })
}