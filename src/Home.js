import React from 'react'
import {useNavigate} from "react-router-dom"
import './styles.css'
import {useState} from 'react'
import{v4 as uuidV4} from 'uuid'

function Home(){
    let navigate = useNavigate();
    const [id, setId] = useState('');
    return (
        <div className="create">
            <h1>Welcome to our Google Docs Clone</h1>
            <form>
                <label>Enter Document Id to open</label>
                <input type="text" placeholder = "Please fill in the id..." value={id}
                onChange={(e) => setId(e.target.value)}/>
                <button onClick={() => {
                    if(id === ""){
                        alert("Please Fill in the Id First...")
                        return;
                    }
                    navigate(`/documents/${id}`)
                }}>Open document</button>
                <br></br><br></br><br></br><br></br>
                <label>Or create new Document</label>
                <br></br>
                <button onClick={() => {
                    navigate(`/documents/${uuidV4()}`)
                }}>Create New Document</button>

            </form>

        </div>
    );
}

export default Home;