import React ,{useRef}from 'react';
import { Stage, Layer, Rect,Circle, Transformer } from 'react-konva';
import draw from './dfdfdf.png'
const Rectangle = ({ shapeProps, isSelected, onSelect, onChange ,handleDeleteItem}) => {
  const shapeRef = React.useRef();
  const trRef = React.useRef();

  const stageWidth = 400; // Set the width of your stage
  const stageHeight = 600; // Set the height of your stage
  React.useEffect(() => {
    if (isSelected) {
      // we need to attach transformer manually
      trRef.current.nodes([shapeRef.current]);
      trRef.current.getLayer().batchDraw();
    }
  }, [isSelected]);

  const handleDragMove = (e) => {
    const node = shapeRef.current;

    // Calculate the boundaries
    const minX = 0;
    const minY = 0;
    const maxX = stageWidth - node.width();
    const maxY = stageHeight - node.height();

    // Limit the draggable area
    const constrainedX = Math.max(minX, Math.min(node.x(), maxX));
    const constrainedY = Math.max(minY, Math.min(node.y(), maxY));

    // Update the position
    node.x(constrainedX);
    node.y(constrainedY);

    // Trigger the onChange callback
    onChange({
      ...shapeProps,
      x: constrainedX,
      y: constrainedY,
    });
  };


  const handleDelete = () => {
    // unSelectShape(null);
    // onDelete(shapeRef.current);
  };
  const deleteButton = React.useRef();


  return (
    <React.Fragment>
      <Rect
        onClick={onSelect}
        onTap={onSelect}
        ref={shapeRef}
        {...shapeProps}
        // draggable={false}
        shadowBlur={10} 
        onDragEnd={(e) => {
          onChange({
            ...shapeProps,
            x: e.target.x(),
            y: e.target.y(),
          });
        }}
        onTransformEnd={(e) => {
          // transformer is changing scale of the node
          // and NOT its width or height
          // but in the store we have only width and height
          // to match the data better we will reset scale on transform end
          const node = shapeRef.current;
          const scaleX = node.scaleX();
          const scaleY = node.scaleY();

          // we will reset it back
          node.scaleX(1);
          node.scaleY(1);
          onChange({
            ...shapeProps,
            x: node.x(),
            y: node.y(),
            // set minimal value
            width: Math.max(5, node.width() * scaleX),
            height: Math.max(node.height() * scaleY),
          });
        }}
        onDragMove={handleDragMove}
      />
      {isSelected && (
        <Transformer
          ref={trRef}
          flipEnabled={false}
          boundBoxFunc={(oldBox, newBox) => {
            // limit resize
            if (Math.abs(newBox.width) < 5 || Math.abs(newBox.height) < 5) {
              return oldBox;
            }
            return newBox;
          }}
        >
             <Circle
            radius={8}
            fill="red"
            ref={deleteButton}
            onClick={()=>handleDeleteItem(shapeProps?.id)}
            x={shapeRef.current.width() }
          ></Circle>
        </Transformer>
      )}
    </React.Fragment>
  );
};

const initialRectangles = [
  {
    x: 10,
    y: 10,
    width: 50,
    height: 50,
    fill: 'transparent',
    id: 'rect1',
    strokeWidth:0.5,
    stroke:"red" ,
    draggable:false

  },
  {
    x: 150,
    y: 150,
    width: 50,
    height: 50,
    fill: 'transparent',
    id: 'rect2',
    strokeWidth:0.5,
    stroke:"red",
    draggable:false
  },
];

const ReactkonvaDraw = () => {
  const [rectangles, setRectangles] = React.useState(initialRectangles);
  const [selectedId, selectShape] = React.useState(null);

  const checkDeselect = (e) => {
    // deselect when clicked on empty area
    const clickedOnEmpty = e.target === e.target.getStage();
    if (clickedOnEmpty) {
      selectShape(null);
    }
  };

  console.log(rectangles)

  const addRectangles=()=>{
    setRectangles((prev)=>[...prev,{
        
            x: 0,
            y: 0,
            width: 50,
            height: 50,
            fill: 'transparent',
            id: 'rect3',
            strokeWidth:0.5,
            stroke:"green" ,
            draggable:true

          },
    ])
  }

  const deleteRectangle=(id)=>{
    setRectangles((prevRectangles) => prevRectangles.filter(rectangle => rectangle.id !== id));
  }
  return (

    <div style={{backgroundColor:'yellow' , width:'100%', height:'100vh', display:'flex', alignItems:'center', justifyContent:'center'}}>
      <img src={draw} alt='d'/>
    <div style={{backgroundColor:'pink', width:'400px', height:'700px', marginLeft:'100px'}}>
    <Stage
      width={400}
      height={window.innerHeight}
      onMouseDown={checkDeselect}
      onTouchStart={checkDeselect}
    >
      <Layer>
        {rectangles.map((rect, i) => {
          return (
            <Rectangle
              key={i}
              shapeProps={rect}
              isSelected={rect.id === selectedId}
              onSelect={() => {
                selectShape(rect.id);
              }}
              onChange={(newAttrs) => {
                const rects = rectangles.slice();
                rects[i] = newAttrs;
                setRectangles(rects);
              }}
              handleDeleteItem={deleteRectangle}
            />
          );
        })}
      </Layer>
    </Stage>
    </div> 
    <button onClick={addRectangles} >Add</button>
    </div>
  );
};

export default ReactkonvaDraw;