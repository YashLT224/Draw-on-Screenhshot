import logo from './logo.svg';
import './App.css';
import DrawKonva from './konva';
// import Resize from './final'
import Resize from './demo2'
function App() {

  const initialRectangles = [
    {
      x: 360.7159992573399,
      y: 257.74198382707743,
      width: 150.08873881250685,
      height: 55.25023762183749,
      imgNaturalWidth:1920,
      imgNaturalHeight:9979,
      fill: "#f2d5d5",
      id: "rect1",
      strokeWidth: 1,
      stroke: "#f71313",
      draggable: false,
      opacity: 0.6,
    
    },
    
  ];
  return (
    <div className="App">
      {/* <DrawKonva/> */}
      <Resize initialRectangles={initialRectangles}/>
    </div>
  );
}

export default App;
