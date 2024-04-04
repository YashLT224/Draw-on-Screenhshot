import React, { useRef, useEffect, useState } from 'react';

const CanvasDrawing = () => {
  // Holds all our boxes
  const [boxes, setBoxes] = useState([]);
  // Holds the 8 tiny boxes that will be our selection handles
  const selectionHandles = useRef(Array.from({ length: 8 }, () => ({})));
  // Holds canvas information
  const canvasRef = useRef(null);
  const ghostCanvasRef = useRef(null);
  const [isDrag, setIsDrag] = useState(false);
  const [isResizeDrag, setIsResizeDrag] = useState(false);
  const [expectResize, setExpectResize] = useState(-1);
  const [mx, setMx] = useState(0);
  const [my, setMy] = useState(0);
  const [mySel,setMySel]=useState(null);
  const [offsetx,setOffsetx]=useState(0);
  const [offsety,setOffsety]=useState(0);


  let canvasValid = false;
//   let mySel = null;
//   let offsetx = 0;
//   let offsety = 0;

  useEffect(() => {
    const canvas = canvasRef.current;
    const ghostCanvas = ghostCanvasRef.current;
    const ctx = canvas.getContext('2d');
    const gctx = ghostCanvas.getContext('2d');

    canvas.onselectstart = function () {
      return false;
    };

    // make mainDraw() fire every INTERVAL milliseconds
    const INTERVAL = 20;
    setInterval(mainDraw, INTERVAL);

    // set our events. Up and down are for dragging,
    // double click is for making new boxes
    canvas.onmousedown = myDown;
    canvas.onmouseup = myUp;
    canvas.ondblclick = myDblClick;
    canvas.onmousemove = myMove;

    // set up the selection handle boxes
    for (let i = 0; i < 8; i++) {
      selectionHandles.current[i] = {};
    }

    // add custom initialization here:

    // add a large green rectangle
    addRect(260, 70, 60, 65, 'rgba(0,205,0,0.7)');

    // add a green-blue rectangle
    addRect(240, 120, 40, 40, 'rgba(2,165,165,0.7)');

    // add a smaller purple rectangle
    addRect(45, 60, 25, 25, 'rgba(150,150,250,0.7)');
  }, []);

  const draw = (context, box, optionalColor) => {
    if (context === ghostCanvasRef.current.getContext('2d')) {
      context.fillStyle = 'black';
    } else {
      context.fillStyle = box.fill;
    }

    if (box.x > canvasRef.current.width || box.y > canvasRef.current.height) return;
    if (box.x + box.w < 0 || box.y + box.h < 0) return;

    context.fillRect(box.x, box.y, box.w, box.h);

    if (box === mySel) {
      context.strokeStyle = '#CC0000';
      context.lineWidth = 2;
      context.strokeRect(box.x, box.y, box.w, box.h);

      const half = 3;

      // Draw the selection handles
      selectionHandles.current.forEach((handle, i) => {
        handle.x = getHandleX(box, i, half);
        handle.y = getHandleY(box, i, half);
        context.fillStyle = 'darkred';
        context.fillRect(handle.x, handle.y, 6, 6);
      });
    }
  };

  const getHandleX = (box, i, half) => {
    switch (i) {
      case 0:
      case 3:
      case 5:
        return box.x - half;
      case 1:
      case 4:
        return box.x + box.w / 2 - half;
      case 2:
      case 7:
        return box.x + box.w - half;
      default:
        return 0;
    }
  };

  const getHandleY = (box, i, half) => {
    switch (i) {
      case 0:
      case 1:
      case 2:
        return box.y - half;
      case 3:
      case 6:
        return box.y + box.h / 2 - half;
      case 5:
      case 4:
        return box.y + box.h - half;
      default:
        return 0;
    }
  };

  const addRect = (x, y, w, h, fill) => {
    setBoxes((prevBoxes) => [
      ...prevBoxes,
      {
        x,
        y,
        w,
        h,
        fill,
      },
    ]);
    invalidate();
  };

  const invalidate = () => {
    draw(canvasRef.current.getContext('2d'), boxes);
  };

  const clear = (c) => {
    c.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
  };

  const mainDraw = () => {
    if (!canvasRef.current.getContext) return;

    const ctx = canvasRef.current.getContext('2d');

    if (!canvasValid) {
      clear(ctx);
      boxes.forEach((box) => draw(ctx, box));
      canvasValid = true;
    }
  };

  const myMove = (e) => {
    if (isDrag) {
      getMouse(e);

      mySel.x = mx - offsetx;
      mySel.y = my - offsety;

      invalidate();
    } else if (isResizeDrag) {
      const oldx = mySel.x;
      const oldy = mySel.y;

      switch (expectResize) {
        case 0:
        case 1:
        case 2:
          mySel.y = my;
          mySel.h += oldy - my;
          break;
        case 3:
        case 5:
          mySel.x = mx;
          mySel.w += oldx - mx;
          break;
        case 4:
        case 7:
          mySel.w = mx - oldx;
          break;
        case 6:
        case 11:
          mySel.h = my - oldy;
          break;
        default:
          break;
      }

      invalidate();
    }

    getMouse(e);

    if (mySel !== null && !isResizeDrag) {
      for (let i = 0; i < 8; i++) {
        const cur = selectionHandles.current[i];

        if (
          mx >= cur.x &&
          mx <= cur.x + 6 &&
          my >= cur.y &&
          my <= cur.y + 6
        ) {
          expectResize = i;
          setCursorStyle(i);
          invalidate();
          return;
        }
      }

      isResizeDrag = false;
      expectResize = -1;
      setCursorStyle(-1);
    }
  };

  const setCursorStyle = (i) => {
    switch (i) {
      case 0:
        canvasRef.current.style.cursor = 'nw-resize';
        break;
      case 1:
        canvasRef.current.style.cursor = 'n-resize';
        break;
      case 2:
        canvasRef.current.style.cursor = 'ne-resize';
        break;
      case 3:
        canvasRef.current.style.cursor = 'w-resize';
        break;
      case 4:
        canvasRef.current.style.cursor = 'e-resize';
        break;
      case 5:
        canvasRef.current.style.cursor = 'sw-resize';
        break;
      case 6:
        canvasRef.current.style.cursor = 's-resize';
        break;
      case 7:
        canvasRef.current.style.cursor = 'se-resize';
        break;
      default:
        canvasRef.current.style.cursor = 'auto';
        break;
    }
  };

  const myDown = (e) => {
    getMouse(e);

    if (expectResize !== -1) {
      setIsResizeDrag(true);
      return;
    }

    clear(ghostCanvasRef.current.getContext('2d'));
    const l = boxes.length;

    for (let i = l - 1; i >= 0; i--) {
      boxes[i].draw(ghostCanvasRef.current.getContext('2d'), 'black');

      const imageData = ghostCanvasRef.current
        .getContext('2d')
        .getImageData(mx, my, 1, 1);
      const index = (mx + my * imageData.width) * 4;

      if (imageData.data[3] > 0) {
        // setMySel(boxes[i]);
        setBoxes((prevBoxes) => {
            const updatedBoxes = [...prevBoxes];
            updatedBoxes[i] = { ...updatedBoxes[i], isSelected: true };
            return updatedBoxes;
          });
          setOffsetx(mx - boxes[i].x);
        setOffsety(my - boxes[i].y);
        // setOffsetx(mx - mySel.x);
        // setOffsety(my - mySel.y);
        mySel.x = mx - offsetx;
        mySel.y = my - offsety;
        setIsDrag(true);

        invalidate();
        clear(ghostCanvasRef.current.getContext('2d'));
        return;
      }
    }

    setMySel(null);
    clear(ghostCanvasRef.current.getContext('2d'));
    invalidate();
  };

  const myUp = () => {
    setIsDrag(false);
    setIsResizeDrag(false);
    setExpectResize(-1);
  };

  const myDblClick = (e) => {
    getMouse(e);
    const width = 20;
    const height = 20;
    addRect(mx - width / 2, my - height / 2, width, height, 'rgba(220,205,65,0.7)');
  };

  const getMouse = (e) => {
    const element = canvasRef.current;
    let offsetX = 0;
    let offsetY = 0;

    if (element.offsetParent) {
      do {
        offsetX += element.offsetLeft;
        offsetY += element.offsetTop;
      } while ((element = element.offsetParent));
    }

    offsetX += stylePaddingLeft + styleBorderLeft;
    offsetY += stylePaddingTop + styleBorderTop;

    setMx(e.pageX - offsetX);
    setMy(e.pageY - offsetY);
  };

  let stylePaddingLeft = parseInt(
    window?.getComputedStyle?.(canvasRef?.current, null)['paddingLeft'],
    10
  ) || 0;
  let stylePaddingTop = parseInt(
    window?.getComputedStyle?.(canvasRef?.current, null)['paddingTop'],
    10
  ) || 0;
  let styleBorderLeft = parseInt(
    window?.getComputedStyle?.(canvasRef?.current, null)['borderLeftWidth'],
    10
  ) || 0;
  let styleBorderTop = parseInt(
    window?.getComputedStyle?.(canvasRef?.current, null)['borderTopWidth'],
    10
  ) || 0;
  let [canvas, setCanvas] = useState(null);
useEffect(() => {
    if (canvas) {
      if (document.defaultView && document.defaultView.getComputedStyle) {
        stylePaddingLeft =
          parseInt(
            document.defaultView.getComputedStyle(canvas, null)['paddingLeft'],
            10
          ) || 0;
        stylePaddingTop =
          parseInt(
            document.defaultView.getComputedStyle(canvas, null)['paddingTop'],
            10
          ) || 0;
        styleBorderLeft =
          parseInt(
            document.defaultView.getComputedStyle(canvas, null)['borderLeftWidth'],
            10
          ) || 0;
        styleBorderTop =
          parseInt(
            document.defaultView.getComputedStyle(canvas, null)['borderTopWidth'],
            10
          ) || 0;
      }
    }
  }, [canvas]);

 
  return (
    <div>
      <canvas
        ref={canvasRef}
        width={400}
        height={300}
        style={{ border: '1px solid #000' }}
      />
      <div style={{ fontFamily: 'Verdana', fontSize: '12px' }}>
        <p>
          Click to select. Click on selection handles to resize. Double click to
          create a new node.
        </p>
        <p>
          <a href="http://simonsarris.com/blog/225-canvas-selecting-resizing-shape">
            link to tutorial
          </a>
        </p>
        <p>
          <a href="http://simonsarris.com/blog/140-canvas-moving-selectable-shapes">
            link to tutorial part 1
          </a>
        </p>
      </div>
    </div>
  );
};

export default CanvasDrawing;
