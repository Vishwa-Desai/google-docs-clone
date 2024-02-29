import './App.css';
import TextEditor from './TextEditor';
import { v4 as uuidV4 } from 'uuid';
import { 
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate   
} from 'react-router-dom'

function App() {
  
  return (
    <Router>
      <Routes>
          <Route path="/" element={ <Navigate to={`/documents/${uuidV4()}`}  /> } >
             
            </Route>
            <Route path="/documents/:id" element={   <TextEditor /> }>
              
            </Route>
        </Routes>
    </Router>
  );
}

export default App;
