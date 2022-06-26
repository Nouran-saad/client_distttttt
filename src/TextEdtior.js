import React from 'react'
import { useCallback, useEffect,useState } from 'react'
import {useParams} from 'react-router-dom'  // route to different routes 
import Quill from "quill"
import "quill/dist/quill.snow.css"
import {io} from 'socket.io-client'
import { Offline } from "react-detect-offline";
const ENDPOINT = 'https://server-dist.herokuapp.com/';

var q;
const editor2=document.createElement("div") 

const INTERVAL_MS = 2000

export default function TextEdtior() {

const [socket,setSocket]=useState()
const [quill,setQuill]=useState()
const {id: documentId}=useParams()
const [user,setUser]=useState(1)
const [change,setchange]=useState()


/* we want to establish the connection once([]) upon rendering so we use a 
useEffect to handle this connection*/
//-------------------handling connection-----------------------

useEffect(() => {
  const s= io(ENDPOINT, {transports:['websocket']});  // url of server // this function returns a socket(state)
  setSocket(s)
   return () => {
    s.disconnect()  //cleaning up 
   }
},[])

     // useEffect? you tell React that your component needs to do something after render(aka display)
//-------------------loading document----------------------
useEffect (()=>{
    if(socket== null || quill==null) return // we have to make sure they are defined because this func depends on them
// once automatically cleans up the event after 
    socket.once ("load-document",document =>{
        quill.setContents (document.data)
        quill.enable() //we enable only if we get document 
        editor2.innerHTML="Number of Current Users "+document.user

    })
  socket.emit ("get-document",documentId) // send to server document ID
  },[socket,quill,documentId])

     useEffect(()=> {
        if(socket== null || quill==null) return

        const handler = (delta,oldDelta,source)=>{
// we do this because we are only interested in the changes the user makes we do not want
// any changes done in the library (not by the user to be sent to the clients)
            if (source!== 'user') return
            socket.emit("send-delta",delta) // is just what changed in the document -- we send this to the server using socket.emit
            setchange(1)
        }
        quill.on('text-change',handler)  // text-change quill API, handler is called whenever text-change is on

        return () => {
            quill.off('text-change',handler)  // upon cleaning up 
        }
    },[socket,quill,change])// this func depends on socket,quill
    
        useEffect(() => {
        if (socket == null || quill == null) return
    
        const interval = setInterval(() => {
            if(change ==1){
                setchange(0)
              socket.emit("save-document", quill.getContents())
              }        
            }, INTERVAL_MS)
        return () => {
          clearInterval(interval)
        }
        }, [socket, quill,change])
        //-------------------updating our document---------------------
        useEffect(()=> {
            if(socket== null || quill==null) return
    
            const handler = (delta)=>{
              
                quill.updateContents(delta)
            }
            socket.on('get-delta',handler)
    
            return () => {
                socket.off('get-delta',handler)
            }
        },[socket,quill])
        
    
        //--------------------update number of users-----------------
        useEffect(()=> {
            if(socket== null) return
              socket.on('users',user => {
              setUser(user)
              editor2.innerHTML="Number of Current Users "+user
            })
        },[socket,user])
    
    
    const wrapperRef= useCallback((wrapper) => {

        var toolbarOptions = [
            ['bold', 'italic', 'underline', 'strike'],        // toggled buttons
            ['blockquote', 'code-block'],
          
            [{ 'list': 'ordered'}, { 'list': 'bullet' }],
            [{ 'script': 'sub'}, { 'script': 'super' }],      // superscript/subscript
            [{ 'indent': '-1'}, { 'indent': '+1' }],          // outdent/indent
            [{ 'direction': 'rtl' }],                         // text direction
          
            [{ 'size': ['small', false, 'large', 'huge'] }],  // custom dropdown
            [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
          
            [{ 'color': [] }, { 'background': [] }],          // dropdown with defaults from theme
            [{ 'font': [] }],
            [{ 'align': [] }],
          
            ['clean']                                         // remove formatting button
          ];
          
       const editor=document.createElement("div") //create an object editor

       wrapper.append(editor2) // put editor into wrapper 

       wrapper.append(editor) // put editor into wrapper 

       editor2.innerHTML="Number of Current Users "
    
       const el = document.getElementById("status")
        setInterval(() => {
          if(el.textContent === "You are Offline, Please Check your Connection and Try Again!"){
            q.disable()
          }
          else{
            q.enable()
          }
        }, 1000);
          
      q=  new Quill(editor,{theme: "snow",
        modules: {
            toolbar: toolbarOptions
            }
        })
        q.disable()  // if no document then disbale 
        q.setText('Loading...') // if disabled display Loading...
        setQuill(q)
    } ,[])

    return (
        <>
  <div>
    <button onClick={()=>{
        var str = window.location.href;
        var loc = str.substring(str.indexOf('documents') + 10);
        navigator.clipboard.writeText(loc);
    }}>Copy to Clipboard</button>
  </div>

  <div id="status">
    <Offline id = "offline">
        You are Offline, Please Check your Connection and Try Again!
    </Offline>



  </div>
  <div className="text container" ref={wrapperRef}></div>

  </>
    )
}
