import React, { useRef, useState, useEffect } from "react";
import {
  Stage,
  Layer,
  Rect,
  Circle,
  Transformer,
  Text,
  Group,
  Image,
} from "react-konva";
import draw from "./dfdfdf.png";
import a1 from "./a1.png";
import a2 from "./a2.png";
import fullpage from "./fullpage.png";

function generateRandomString(length) {
  let result = "";
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  const charactersLength = characters.length;
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}

const Rectangle = ({
  shapeProps,
  isSelected,
  onSelect,
  onChange,
  handleDeleteItem,
  height,
  width,
}) => {
  const shapeRef = React.useRef();
  const trRef = React.useRef();
  const deleteButtonRef = React.useRef();

  const stageWidth = width; // Set the width of your stage
  const stageHeight = height; // Set the height of your stage
  React.useEffect(() => {
    if (isSelected) {
      // we need to attach transformer manually
      trRef?.current?.nodes([shapeRef?.current]);
      trRef?.current?.getLayer()?.batchDraw();
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
    node?.x(constrainedX);
    node?.y(constrainedY);
    onChange({
      ...shapeProps,
      x: constrainedX,
      y: constrainedY,
    });
  };

  return (
    <React.Fragment>
      <Rect
        onClick={onSelect}
        onTap={onSelect}
        ref={shapeRef}
        {...shapeProps}
        onDragEnd={(e) => {
          onChange({
            ...shapeProps,
            x: e.target.x(),
            y: e.target.y(),
          });
        }}
        onDragEnd={(e) => {
          onChange({
            ...shapeProps,
            x: e.target.x(),
            y: e.target.y(),
          });
        }}
        onTransformEnd={(e) => {
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
          anchorCornerRadius={10}
          anchorSize={4}
          rotateEnabled={false}
          anchorStrokeWidth={1}
          anchorFill={"#fff"}
          anchorStroke={"#666"}
          flipEnabled={false}
          ref={trRef}
          flipEnabled={false}
          boundBoxFunc={(oldBox, newBox) => {
            // Define the image boundaries
            const imageBoundaries = {
              minX: 0,
              minY: 0,
              maxX: width,
              maxY: height,
            };

            // Ensure the new box does not go outside the image boundaries
            // Adjust the width and height if the new box exceeds image boundaries
            if (newBox.x < imageBoundaries.minX) {
              newBox.x = imageBoundaries.minX;
              newBox.width = oldBox.width;
            }
            if (newBox.y < imageBoundaries.minY) {
              newBox.y = imageBoundaries.minY;
              newBox.height = oldBox.height;
            }
            if (newBox.x + newBox.width > imageBoundaries.maxX) {
              newBox.width = imageBoundaries.maxX - newBox.x;
            }
            if (newBox.y + newBox.height > imageBoundaries.maxY) {
              newBox.height = imageBoundaries.maxY - newBox.y;
            }

            // Ensure width and height are not less than a minimum size to avoid negative dimensions
            newBox.width = Math.max(5, newBox.width);
            newBox.height = Math.max(5, newBox.height);

            return newBox;
          }}
        >
          {isSelected && (
            <Group
              x={0}
              y={0}
              onClick={() => handleDeleteItem(shapeProps.id)}
              onTap={() => handleDeleteItem(shapeProps.id)}
            >
              <Circle radius={7} fill="#D55847" ref={deleteButtonRef} />
              <Text
                text="X"
                fontSize={9}
                fontFamily="Arial"
                fill="#fff"
                align="center"
                verticalAlign="middle"
                width={11} // Ensure the text is centered
                height={10}
                offsetX={0} // Center the text in the circle
                offsetY={2} // Adjust based on the circle's position and size
                x={-5.5} // Half of the average width of the character X in this font and size
                y={-2} // Half the font size, approximately centers vertically
              />
            </Group>
          )}
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
    fill: "#f2d5d5",
    id: "rect1",
    strokeWidth: 1,
    stroke: "#f71313",
    draggable: false,
    opacity: 0.6,
  },
  {
    x: 136.71665695981343,
    y: 551.4570649821488,
    width: 210.97845078625485,
    height: 72.15261408677404,
    fill: "#f2d5d5",
    id: "rect24",
    strokeWidth: 0.5,
    stroke: "#f71313",
    draggable: false,
    opacity: 0.6,
  },
];

const ReactkonvaDraw = () => {
  const [rectangles, setRectangles] = React.useState(initialRectangles);
  const [selectedId, selectShape] = React.useState(null);
  const [imageDimensions, setImageDimensions] = useState({
    width: 0,
    height: 0,
  });
  const [naturalDimensions, setNaturalDimensions] = useState({
    width: 0,
    height: 0,
  });
  const imageRef = useRef(null);
  const DefaultDisplayRectangles = useRef(true);
  const rectanglesRef = useRef(initialRectangles); // Add this ref

  /*------------------------default draw logic start------------------------ */
 
 
 
  const handleImageLoaded = (e) => {
    setNaturalDimensions({
      width: e.target.naturalWidth,
      height: e.target.naturalHeight,
    });
    setImageDimensions({
      width: e.target.clientWidth,
      height: e.target.clientHeight,
    });
  };


  useEffect(() => {
    // Get the width of the image element
    if (imageRef.current) {
      setImageDimensions({
        width: imageRef.current.clientWidth,
        height: imageRef.current.clientHeight,
      });
      setNaturalDimensions({
        width: imageRef.current.naturalWidth,
        height: imageRef.current.naturalHeight,
      });
    }
  }, [imageRef]);


  //Default rectangles drawn
  useEffect(() => {
    if (
      imageDimensions?.width > 0 &&
      naturalDimensions?.width > 0 &&
      DefaultDisplayRectangles?.current
    ) {
      fetchAndScaleRectangles();
      DefaultDisplayRectangles.current = false;
    }
  }, [imageDimensions, naturalDimensions]);

  const fetchAndScaleRectangles = () => {
    // Simulate fetching data from backend
    const scaledRectangles = rectangles.map((rect) =>
      scaleToDisplayedSize(rect, naturalDimensions, imageDimensions)
    );
    setRectangles(scaledRectangles);
  };

  const scaleToDisplayedSize = (
    rect,
    naturalDimensions,
    displayedDimensions
  ) => {
    //converting from natural to Client width
    const scaleX = displayedDimensions.width / naturalDimensions.width;
    const scaleY = displayedDimensions.height / naturalDimensions.height;

    return {
      ...rect,
      x: rect.x * scaleX,
      y: rect.y * scaleY,
      width: rect.width * scaleX,
      height: rect.height * scaleY,
    };
  };

  /*------------------------Submit coordinates start------------------------ */

  const scaleToNaturalSize = (rect, displayedDimensions, naturalDimensions) => {
    //converting from Client  to natural width
    const scaleX = naturalDimensions.width / displayedDimensions.width;
    const scaleY = naturalDimensions.height / displayedDimensions.height;

    return {
      ...rect,
      x: rect.x * scaleX,
      y: rect.y * scaleY,
      width: rect.width * scaleX,
      height: rect.height * scaleY,
    };
  };
  const SubmitCoordinates = () => {
    const scaledRectangles = rectangles.map((rect) =>
      scaleToNaturalSize(rect, imageDimensions, naturalDimensions)
    );
    console.log(scaledRectangles);
  };

   /*------------------------controls start------------------------ */
   const addRectangles = () => {
    const newRect = {
      x: 20, // Example starting position, adjust based on your needs
      y: 20,
      width: 100, // Example size, adjust based on your needs
      height: 100,
      fill: "#CFEBFF",
      id: generateRandomString(5),
      strokeWidth: 1,
      stroke: "#3CACFF",
      draggable: true,
      opacity: 0.6,
    };

    if (imageDimensions.width > 0 && imageDimensions.height > 0) {
      const scaleX = imageDimensions.width / imageDimensions.width;
      const scaleY = imageDimensions.height / imageDimensions.height;

      newRect.x *= scaleX;
      newRect.y *= scaleY;
      newRect.width *= scaleX;
      newRect.height *= scaleY;
    }
    setRectangles(rectangles.concat(newRect));
  };

  const deleteRectangle = (id) => {
    setRectangles((prevRectangles) =>
      prevRectangles.filter((rectangle) => rectangle.id !== id)
    );
  };

  const checkDeselect = (e) => {
    const clickedOnEmpty = e.target === e.target.getStage();
    if (clickedOnEmpty) {
      selectShape(null);
    }
  };

  /*------------------------responsiveness handle  start------------------------ */

  useEffect(() => {
    rectanglesRef.current = rectangles; // Update ref whenever rectangles state changes
  }, [rectangles]);
  //   useEffect(() => {
  //     // This is to ensure dimensions are updated if the image loads after the initial render
  //     if (imageRef.current && imageRef.current.complete) {
  //       handleImageLoad();
  //     }
  //   }, []); // Empty dependency array ensures this effect runs only once after the initial render

  // const handleImageLoad = () => {
  //     if (imageRef.current) {
  //       setImageDimensions({
  //         width: imageRef.current.clientWidth,
  //         height: imageRef.current.clientHeight,
  //       });
  //     }
  //   };



  //   useEffect(() => {
  //     // Define the resize handler function
  //     const handleResize = () => {
  //         if (imageRef.current && imageDimensions.width && imageDimensions.height) {
  //             // Calculate the new scale factor
  //             const scaleX = imageRef.current.clientWidth / imageDimensions.width;
  //             const scaleY = imageRef.current.clientHeight / imageDimensions.height;

  //             // Update the dimensions of the image/stage
  //             setImageDimensions({
  //               width: imageRef.current.clientWidth,
  //               height: imageRef.current.clientHeight,
  //             });

  //             // Apply the scale factor to each rectangle
  //             const scaledRectangles = rectangles.map(rect => ({
  //               ...rect,
  //               x: rect.x * scaleX,
  //               y: rect.y * scaleY,
  //               width: rect.width * scaleX,
  //               height: rect.height * scaleY,
  //             }));

  //             setRectangles(scaledRectangles);
  //           }
  //     };

  //     // Attach the resize handler to the window resize event
  //     window.addEventListener('resize', handleResize);

  //     // Cleanup function to remove the event listener when the component unmounts
  //     return () => {
  //       window.removeEventListener('resize', handleResize);
  //     };
  //   }, [imageDimensions,rectangles]);

useEffect(() => {
    const handleResize = () => {
      if (imageRef.current&& imageDimensions.width>0 && imageDimensions.height>0) {
        const currentClientWidth = imageRef.current.clientWidth;
        const currentClientHeight = imageRef.current.clientHeight;
        setImageDimensions({
          width: currentClientWidth,
          height: currentClientHeight,
        });
        const scaleX = currentClientWidth / imageDimensions.width;
        const scaleY = currentClientHeight / imageDimensions.height;
        const scaledRectangles = rectangles.map(rect => ({
          ...rect,
          x: rect.x * scaleX,
          y: rect.y * scaleY,
          width: rect.width * scaleX,
          height: rect.height * scaleY,
        }));
        console.log(rectangles,rectanglesRef.current);
        setRectangles(scaledRectangles);
      }
    };
  
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [naturalDimensions,imageDimensions,rectangles]);  
  

  
  return (
      <>

    <div
      style={{
        backgroundColor: "brown",
        width: "100%",
        height: "100vh",
        overflow: "auto",
        paddingTop: "20px",
      }}
    >
      <div
        id="yellowdiv"
        style={{
          position: "relative",
          maxWidth: "100%",
          display: "flex",
          justifyContent: "center",
          backgroundColor: "yellow",
        }}
      >
        <img
          id="img"
          ref={imageRef}
          style={{ maxWidth: "100%", height: "auto", display: "hidden" }}
          src={fullpage}
          onLoad={handleImageLoaded}
          alt="d"
        />
        <div
          id="abc"
          style={{
            position: "absolute",
            backgroundColor: "transparent",
            top: "0",
            left: "50%",
            transform: "translateX(-50%)",
            width: `${imageDimensions.width}px`,
            height: `${imageDimensions.height}px`,
          }}
        >
          <Stage
            width={imageDimensions.width} //numeric value
            height={imageDimensions.height}
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
                      rect?.draggable && selectShape(rect?.id);
                    }}
                    onChange={(newAttrs) => {
                      const rects = rectangles.slice();
                      rects[i] = newAttrs;
                      setRectangles(rects);
                    }}
                    handleDeleteItem={deleteRectangle}
                    height={imageDimensions.height}
                    width={imageDimensions.width}
                  />
                );
              })}
            </Layer>
          </Stage>
        </div>
      </div>
      <button onClick={addRectangles}>+ Add Area</button>
      <button onClick={SubmitCoordinates}>Submit</button>
    </div>
   
   </>
  );
};

export default ReactkonvaDraw;
