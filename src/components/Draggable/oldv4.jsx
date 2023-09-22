import React, { useState, useRef, useEffect } from "react";
import ReactDOM from "react-dom";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import "./Draggable.css"
import html2canvas from 'html2canvas';
import vite from "../../../public/vite.svg"
// import ReactCrop from 'react-easy-crop';
import Modal from 'react-modal';
import ReactCrop, {
  centerCrop,
  makeAspectCrop,
  convertToPixelCrop,
} from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css'
import { v4 as uuidv4 } from 'uuid';




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
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedImageUrl, setSelectedImageUrl] = useState('');
  const [selectedImageId, setSelectedImageId] = useState('');
  const [croppedImage, setCroppedImage] = useState(null); // State to store cropped image data
  const [aspect, setAspect] = useState(1)
  const [isImageLoaded, setIsImageLoaded] = useState(false);

  const [crop, setCrop] = useState({
    unit: '%', // Can be 'px' or '%'
    x: 25,
    y: 25,
    width: 50,
    height: 50
  });
  

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

//   function onImageLoad(e) {
//       const { width, height } = e.currentTarget
//       setCrop(centerAspectCrop(width, height, aspect))
//   }

  const handleImageUpload = (event) => {
    const files = event.target.files;
    const imageItems = Array.from(files).map((file, index) => ({
      id: `image-${index}-${new Date().getTime()}`,
      content: <img src={URL.createObjectURL(file)} alt={`Image ${index}`} />,
      url: URL.createObjectURL(file), // Save the image URL
     // Initial crop data
    }));
    setState([[...selectedImages, ...imageItems]]);
  };

  const openModal = (imageUrl, itemId) => {
    setSelectedImageUrl(imageUrl);
    setSelectedImageId(itemId);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setSelectedImageUrl('');
    setIsModalOpen(false);
  };
  

  const onImageLoad = (e) => {
    if (aspect && isImageLoaded) {
      const { width, height } = e.currentTarget;
      setCrop(centerAspectCrop(width, height, aspect));
    }
  };

  const onCropChange = (newCrop) => {
    setCrop(newCrop);
  };
  

  const onCropComplete = (crop) => {
    makeClientCrop(crop);
  };

  const handleApplyCrop = async () => {
    if (selectedImageUrl && crop.width && crop.height) {
      const croppedImageUrl = await getCroppedImg(
        selectedImageUrl,
        crop,
        'newFile.jpeg' // You can set the file name here
      );
      console.log(selectedImageId)
      console.log(croppedImageUrl)

    //   setCroppedImage(croppedImageUrl)



      var newArray = [...state]
      newArray= newArray[0]
      newArray.push({"id" : uuidv4(), "content" : uuidv4(), "url" : croppedImageUrl})

    //   const indexOfObjectToUpdate = newArray.findIndex((obj) => obj.id === selectedImageId);

    //   if (indexOfObjectToUpdate !== -1) {
    //     // Create a new object with the updated URL property
    //     const updatedObject = {
    //       ...newArray[indexOfObjectToUpdate], // Copy all existing properties
    //       url: croppedImageUrl,                   // Update the URL property
    //     };
    
    //     // Replace the old object with the updated one
    //     newArray[indexOfObjectToUpdate] = updatedObject;
    
    //     // Set the state with the new array
    //     setState([newArray]);
    //   } else {
    //     console.error("Object with the specified id not found.");
    //   }

    setState([newArray]);

      
    //   Here, you can save the `croppedImageUrl` to your desired location or state
    //   For example, you can setState to store it for later use
    //   setMyCroppedImage(croppedImageUrl); // Assuming you have a state variable for the cropped image
  
      closeModal();
    }
  };

  // Function to get cropped image data
  const getCroppedImg = (imageSrc, crop, fileName) => {
    return new Promise((resolve, reject) => {
      const image = new Image();
      image.src = imageSrc;
      image.onload = () => {
        const canvas = document.createElement('canvas');
        const scaleX = image.naturalWidth / image.width;
        const scaleY = image.naturalHeight / image.height;
        console.log(scaleX, scaleY, "pop", image.width, image.height)
        console.log(image.naturalWidth, "pop",image.naturalHeight)
        console.log(crop.x, crop.y, crop.width, crop.height)
        canvas.width = crop.width;
        canvas.height = crop.height;
        const ctx = canvas.getContext('2d');

        ctx.drawImage(
          image,
          crop.x * scaleX,
          crop.y * scaleY,
          crop.width * scaleX,
          crop.height * scaleY,
          0,
          0,
          crop.width,
          crop.height
        );

        console.log(canvas)

        canvas.toBlob((blob) => {
          if (!blob) {
            reject(new Error('Canvas is empty'));
            return;
          }
          blob.name = fileName;
          resolve(window.URL.createObjectURL(blob));
        }, 'image/jpeg');
      };
    });
  };

  function centerAspectCrop(
    mediaWidth,
    mediaHeight,
    aspect
  ) {
    return centerCrop(
      makeAspectCrop(
        {
          unit: '%',
          width: 90,
        },
        aspect,
        mediaWidth,
        mediaHeight,
      ),
      mediaWidth,
      mediaHeight,
    )
  }

//   function onImageLoad(e) {
//     if (aspect) {
//       const { width, height } = e.currentTarget
//       setCrop(centerAspectCrop(width, height, aspect))
//     }
//   }


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
                            <button
                            type="button"
                            onClick={() => openModal(item.url, item.id)}
                        >
                            Crop Image
                        </button>
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
      <Modal
      isOpen={isModalOpen}
      onRequestClose={closeModal}
      style={{
        overlay: {
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
        },
        content: {
        //   width: '80%', // Set the width of the modal content
        //   height: '80vh', // Set the height of the modal content
          margin: 'auto',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
        },
      }}
    >

<ReactCrop crop={crop} onChange={(_, percentCrop) => setCrop(percentCrop)}>
<img
        src={selectedImageUrl}
        
        alt="Selected Image"
        style={{ maxWidth: '100%', maxHeight: '100%' }}
        onLoad={() => setIsImageLoaded(true)}
      /> </ReactCrop>
    <button onClick={handleApplyCrop}>Apply</button>
      <button onClick={closeModal}>Close</button>
    </Modal>
    </div>
  );
}

// const rootElement = document.getElementById("root");
// ReactDOM.render(<QuoteApp />, rootElement);

export default QuoteApp;
