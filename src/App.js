import { useState, useEffect } from "react";
import Tesseract from "tesseract.js";
import Loader from "./components/Loader";
import { MdCloudUpload, MdDelete } from "react-icons/md";
import Copy from "./components/Copy";
import "./App.css";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function App() {
  const [image, setImage] = useState(null);
  const [text, setText] = useState(null);
  const [progress, setProgress] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (event) => {
    setIsLoading(true);
    setImage(URL.createObjectURL(event.target.files[0]));
    setIsLoading(false);
  };

  const handleOnPaste = (event) => {
    setIsLoading(true);
    console.log({ event });
    const items = (event.clipboardData || event.originalEvent.clipboardData)
      .items;

    console.log("items: ", JSON.stringify(items));

    let blob = null;
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf("image") === 0) {
        blob = items[i].getAsFile();
      }
    }

    if (blob !== null) {
      // console.log({ blob });
      const reader = new FileReader();
      reader.onload = function (event) {
        // console.log(event.target.result); // data url!
        // console.log(event.target);
        setImage(event.target.result);
      };
      reader.readAsDataURL(blob);

      console.log({ reader });
    }
    setIsLoading(false);
  };

  const deleteImage = () => {
    setIsLoading(true);
    setImage(null);
    setIsLoading(false);
  };
  const handleClick = () => {
    if (!image) {
      toast.error("Please upload the image!");
      return;
    }
    Tesseract.recognize(image, "eng", {
      logger: (m) => {
        setProgress(parseInt(m.progress * 100));
      },
    })
      .catch((err) => {
        console.error(err);
      })
      .then((result) => {
        // Get Confidence score
        // let confidence = result.confidence
        // Get full output
        let text = result.data.text;
        setText(text);
      });
  };

  useEffect(() => {
    setText(text);
  }, [text]);

  return (
    <>
      <div className="App"></div>
      <header>
        <h1 className="header">Image to Text Converter</h1>
      </header>
      <div className="container">
        <div className="group">
          {isLoading ? (
            <Loader />
          ) : (
            <>
              {!image ? (
                <>
                  <label className="label">
                    <div className="file-inner-container">
                      <MdCloudUpload className="upload-icon" />
                      <p className="upload-text">Click here to upload</p>
                    </div>
                    <input
                      type="file"
                      name="uploadimage"
                      onChange={handleChange}
                      className="upload"
                    />
                  </label>
                </>
              ) : (
                <>
                  <div className="dispaly-image">
                    <img
                      src={image}
                      alt="uploaded"
                      className="uploaded-image"
                    />
                    <MdDelete className="delete-icon" onClick={deleteImage} />
                  </div>
                </>
              )}
            </>
          )}
          <textarea placeholder="Paste from clipboard" onPaste={handleOnPaste} />
        </div>
        
        <button onClick={handleClick} className="btn">
          Convert to text
        </button>
        {progress < 100 && progress > 0 && (
          <div>
            <div className="progress-label">Progress ({progress}%)</div>
            <div className="progress-bar">
              <div className="progress" style={{ width: `${progress}%` }}></div>
            </div>
          </div>
        )}

        {text && <Copy text={text} />}
      </div>
      <ToastContainer />
    </>
  );
}

export default App;
