import React, { useState, useRef, useEffect } from "react";
import ReactDOM from "react-dom";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import "./Draggable.css"
import html2canvas from 'html2canvas';
import vite from "../../../public/vite.svg"
import ReactCrop from 'react-easy-crop';


const getItems = (count, offset = 0) =>
  Array.from({ length: count }, (v, k) => k).map((k) => ({
    id: `item-${k + offset}-${new Date().getTime()}`,
    content: `item ${k + offset}`,
    url: vite

  }));

const reorder = (list, startIndex, endIndex) => {
  const result = Array.from(list);
  const [removed] = result.splice(startIndex, 1);
  result.splice(endIndex, 0, removed);
  return result;
};

const move = (source, destination, droppableSource, droppableDestination) => {
  const sourceClone = Array.from(source);
  const destClone = Array.from(destination);
  const [removed] = sourceClone.splice(droppableSource.index, 1);
  destClone.splice(droppableDestination.index, 0, removed);
  const result = {};
  result[droppableSource.droppableId] = sourceClone;
  result[droppableDestination.droppableId] = destClone;
  return result;
};

const grid = 8;

const getItemStyle = (isDragging, draggableStyle) => ({
  userSelect: "none",
  padding: grid * 2,
  margin: `0 0 ${grid}px 0`,
  background: isDragging ? "lightgreen" : "grey",
  ...draggableStyle,
});

const getListStyle = (isDraggingOver) => ({
  background: isDraggingOver ? "lightblue" : "lightgrey",
  padding: grid,
  width: 250,
});

function QuoteApp() {
  const [state, setState] = useState([]);
  const [selectedImages, setSelectedImages] = useState([]);
  const [gridRows, setGridRows] = useState(2); // State for grid rows
  const [gridColumns, setGridColumns] = useState(3); // State for grid columns
  const canvasRef = useRef();
  console.log(state)



  function onDragEnd(result) {
    const { source, destination } = result;
    if (!destination) {
      return;
    }
    const sInd = +source.droppableId;
    const dInd = +destination.droppableId;
    if (sInd === dInd) {
      const items = reorder(state[sInd], source.index, destination.index);
      const newState = [...state];
      newState[sInd] = items;
      setState(newState);
    } else {
      const result = move(state[sInd], state[dInd], source, destination);
      const newState = [...state];
      newState[sInd] = result[sInd];
      newState[dInd] = result[dInd];
      setState(newState.filter((group) => group.length));
    }
    
  }

  function generateCollage() {
    const collage = document.createElement("div");
    collage.classList.add("collage");
    collage.id = 'collage'
  
    state.forEach((innerArray) => {
      const verticalContainer = document.createElement("div");
      verticalContainer.classList.add("vertical-container");
  
      innerArray.forEach((imageUrl) => {
        const img = document.createElement("img");
        img.src = imageUrl.url;
        img.crossOrigin = "anonymous"
        verticalContainer.appendChild(img);
      });
  
      collage.appendChild(verticalContainer);
    });
  
    // Append the collage to the document
    const myNode = document.getElementById("collage-container");
        while (myNode.firstChild) {
            myNode.removeChild(myNode.lastChild);
        }
    document.getElementById("collage-container").appendChild(collage);
  
    // Use html2canvas to capture the entire collage
  }

  const downloadCollage = async() =>{

      // Use html2canvas to capture the entire collage
      const imagery = document.getElementById("collage-container")
      imagery.hidden=false
      const canvas = await html2canvas(document.getElementById("collage-container"))

      console.log("canvas", canvas)
      const link2Download = canvas.toDataURL('image/png')
      var link = document.createElement("a");
      link.download = "merged_image.png";
      link.href = link2Download;
      link.style.width = "100%"; // Set the width of the downloaded image to 100%
      link.style.height = "auto";
      link.click();
      imagery.hidden=true
  }
  
  useEffect(() => {
    generateCollage();
  }, [state]); 

  const handleImageUpload = (event) => {
    const files = event.target.files;
    const imageItems = Array.from(files).map((file, index) => ({
      id: `image-${index}-${new Date().getTime()}`,
      content: <img src={URL.createObjectURL(file)} alt={`Image ${index}`} />,
      url: URL.createObjectURL(file), // Save the image URL
      crop: { x: 0, y: 0, width: 100, height: 100 }, // Initial crop data
    }));
    setState([[...selectedImages, ...imageItems]]);
  };

  return (
    <div>
        {/* <canvas ref={canvasRef} /> */}
        <div hidden id="collage-container"></div>
      <button
        type="button"
        onClick={() => {
          setState([...state, []]);
        }}
      >
        Add new group
      </button>
      <button
        type="button"
        onClick={() => {
          setState([...state, getItems(1)]);
        }}
      >
        Add new item
      </button>
      {/* <button
        type="button"
        onClick={handleImageUpload}
      >
       Upload Image
      </button> */}

      <button
        type="button"
        onClick={downloadCollage}
      >
       Download Image
      </button>
      <input
        type="file"
        multiple
        accept="image/*"
        onChange={handleImageUpload}
      />
      <div style={{ display: "flex" }}>
        <DragDropContext onDragEnd={onDragEnd}>
          {state.map((el, ind) => (
            <Droppable key={ind} droppableId={`${ind}`}>
              {(provided, snapshot) => (
                <div
                  ref={provided.innerRef}
                  style={getListStyle(snapshot.isDraggingOver)}
                  {...provided.droppableProps}
                >
                  {el.map((item, index) => (
                    <Draggable key={item.id} draggableId={item.id} index={index}>
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          style={getItemStyle(
                            snapshot.isDragging,
                            provided.draggableProps.style
                          )}
                        >
                          <div
                            style={{
                              display: "flex",
                              justifyContent: "space-around",
                            }}
                          >
                            <img style={{
                              width: "100px",
                              height: "100px"
                            }} src={item.url} alt={item.url} crossOrigin="anonymous"/>
                            {/* {item.content} */}
                          </div>
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          ))}
        </DragDropContext>
      </div>
      {/* <div>
        <h2>Uploaded Images</h2>
        <div>
          {selectedImages.map((imageItem) => (
            <div key={imageItem.id}>
              {imageItem.content}
              <button
                type="button"
                onClick={() => handleDeleteImage(imageItem.id)}
              >
                delete
              </button>
            </div>
          ))}
        </div>
      </div> */}
    </div>
  );
}

// const rootElement = document.getElementById("root");
// ReactDOM.render(<QuoteApp />, rootElement);

export default QuoteApp;
