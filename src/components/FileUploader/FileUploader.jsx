import React, { useState } from 'react';
import Dropzone from 'react-dropzone';
import { DragDropContext, Draggable, Droppable } from 'react-beautiful-dnd';
import './FileUploader.css';
import { v4 as uuidv4 } from 'uuid';


function ImageUploader() {
    const [images, setImages] = useState([]);
    const [rowCount, setRowCount] = useState(3);
    const [colCount, setColCount] = useState(3);
  
    const handleDrop = (acceptedFiles) => {
      setImages([...images, ...acceptedFiles]);
    };
  
    const onDragEnd = (result) => {
        if (!result.destination) return;
      
        const sourceIndex = result.source.index;
        const destinationIndex = result.destination.index;
        console.log("destiantion and source", sourceIndex, destinationIndex)
      
        if (sourceIndex === destinationIndex) return; // No need to replace if dropped in the same position
      
        const reorderedImages = [...images];
      
        // Swap images within the same grid cell
        const sourceImage = reorderedImages[sourceIndex];
        reorderedImages[sourceIndex] = reorderedImages[destinationIndex];
        reorderedImages[destinationIndex] = sourceImage;
      
        setImages(reorderedImages);
      };
      
      
  
    return (
      <div className="image-uploader">
        <div className="grid-inputs">
          <label>Rows:</label>
          <input
            type="number"
            min="1"
            value={rowCount}
            onChange={(e) => setRowCount(Number(e.target.value))}
          />
          <label>Columns:</label>
          <input
            type="number"
            min="1"
            value={colCount}
            onChange={(e) => setColCount(Number(e.target.value))}
          />
        </div>
  
        <Dropzone onDrop={handleDrop} accept="image/*" multiple={true}>
          {({ getRootProps, getInputProps }) => (
            <div {...getRootProps()} className="dropzone">
              <input {...getInputProps()} />
              <p>Drag &amp; drop images here, or click to select files</p>
            </div>
          )}
        </Dropzone>
  
        <DragDropContext onDragEnd={onDragEnd}>
          <Droppable droppableId="images">
            {(provided) => (
              <div
                className="image-preview"
                {...provided.droppableProps}
                ref={provided.innerRef}
              >
                {[...Array(rowCount)].map((_, rowIndex) => (
                  <div key={rowIndex} className="image-row">
                    {[...Array(colCount)].map((_, colIndex) => {
                      const imageIndex = rowIndex * colCount + colIndex;
                      const image =
                        imageIndex < images.length
                          ? images[imageIndex]
                          : null;
  
                      return (
                        <Draggable
                        key={colIndex}
                        draggableId={`empty-${uuidv4()}`} // Use a unique ID
                        index={colIndex}
                        isDragDisabled={!image}
                        >
                        {(provided, snapshot) => (
                            <div
                            key={colIndex}
                            className="image-container"
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps} // Add dragHandleProps
                            >
                            {image && (
                                <img
                                src={
                                    image.type === 'image/tiff' ||
                                    image.name.endsWith('.tiff') ||
                                    image.name.endsWith('.tif')
                                    ? URL.createObjectURL(image).replace(/\.(tiff|tif)$/, '.png')
                                    : URL.createObjectURL(image)
                                }
                                alt={`Image ${imageIndex}`}
                                />
                            )}
                            </div>
                        )}
                        </Draggable>


                      );
                    })}
                  </div>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
      </div>
    );
  }
  

export default ImageUploader;
