import React,{ useCallback,useEffect,useState } from 'react'
import Quill from "quill"
import "quill/dist/quill.snow.css"
import "./style.css"
import { io } from 'socket.io-client'
import { useParams } from "react-router-dom"

const TOOLBAR_OPTIONS = [
    [{ header: [1, 2, 3, 4, 5, 6, false] }],
    [{ font: [] }],
    [{ list: "ordered" }, { list: "bullet" }],
    ["bold", "italic", "underline"],
    [{ color: [] }, { background: [] }],
    [{ script: "sub" }, { script: "super" }],
    [{ align: [] }],
    ["image", "blockquote", "code-block"],
    ["clean"],
  ]

function TextEditor() {
    const [socket,setSocket] = useState()
    const [quill,setQuill] = useState()
    const { id : documentId } = useParams()
    const SAVE_INTERVAL_MS = 2000

    // to create room for users, so that they can use same document to change
    useEffect(() => {
        if(socket == null || quill == null) return;

        socket.once("load-document",document => {
            quill.setContents(document)
            quill.enable()
        })
        socket.emit("get-document",documentId)
    },[socket,quill,documentId]);

    // connecting server socket
    useEffect(()=> {
        const s = io("http://localhost:3001")
        setSocket(s);

        return () => {
            s.disconnect();
        }
    },[]);

    //detecting changes whenever  quill is changing
    useEffect(()=> {
        console.log(socket)
        if (socket == null || quill == null) return
        const handler = (delta,oldDelta,source) => {
            if(source !== 'user') return 
            socket.emit("send-changes",delta)
        }
        console.log(quill);

        quill.on("text-change",handler)

        return () => {
            quill.off('text-change',handler)
        }
        },[socket,quill])
    
    //receiving changes from the server and showing it to user
    useEffect(()=> {
        console.log(socket)
        if (socket == null || quill == null) return
        const handler = (delta) => {
            quill.updateContents(delta)
        }
        console.log(quill);

        socket.on("receive-changes",handler)

        return () => {
            socket.off('receive-changes',handler)
        }
    },[socket,quill]);

    // saving document
    useEffect(() => {
        if(socket==null || quill==null) return
        const interval = setInterval(() => {
            socket.emit('save-document',quill.getContets())
        },SAVE_INTERVAL_MS)

        return () => {
            clearInterval(interval)
        }
    },[socket,quill])

    const wrapperRef = useCallback((wrapper)=>{
        if(wrapper==null) return;
        wrapper.innerHTML = ""
        const editor = document.createElement('div')
        wrapper.append(editor);

        const q = new Quill(editor,{ theme : "snow",  modules: { toolbar: TOOLBAR_OPTIONS }})
      
        setQuill(q);
        console.log(q);

    },[])
    return (
        <div className="container" ref={wrapperRef}></div>
    )
}

export default TextEditor